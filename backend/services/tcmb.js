import { fetchWithTimeout } from "./network.js";

const SERIES = "TP.DK.USD.A.YTL-TP.DK.EUR.A.YTL";
const EVDS_URL = "https://evds2.tcmb.gov.tr/service/evds";
const HOUR_MS = 60 * 60 * 1000;
let memoryRates = null;

function formatEvdsDate(date) {
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

function numeric(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseFloat(value.replace(",", "."));
  return Number.NaN;
}

function rowNumber(row, key) {
  return numeric(row?.[key] ?? row?.[key.replaceAll(".", "_")] ?? row?.[key.replaceAll("_", ".")]);
}

function normalizeRates({ usd, eur, source, stale = false, warning = null }) {
  if (!Number.isFinite(usd) || !Number.isFinite(eur)) {
    throw new Error("TCMB kuru geçersiz döndü.");
  }

  return {
    USD_TRY: usd,
    EUR_TRY: eur,
    fetchedAt: new Date().toISOString(),
    source,
    stale,
    warning,
  };
}

export async function fetchEvdsRates() {
  if (!process.env.TCMB_EVDS_API_KEY) {
    throw new Error("TCMB_EVDS_API_KEY tanımlı değil.");
  }

  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 10);
  const params = new URLSearchParams({
    series: SERIES,
    startDate: formatEvdsDate(start),
    endDate: formatEvdsDate(today),
    type: "json",
    aggregationTypes: "last",
    formulas: "0-0",
    frequency: "1",
  });
  const url = `${EVDS_URL}/${params.toString()}`;

  const response = await fetchWithTimeout(url, {
    headers: { Accept: "application/json", key: process.env.TCMB_EVDS_API_KEY },
  });

  if (!response.ok) {
    throw new Error(`TCMB EVDS başarısız: ${response.status}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(`TCMB EVDS JSON yerine ${contentType || "bilinmeyen içerik"} döndü.`);
  }

  const data = await response.json();
  const last = [...(data?.items ?? [])]
    .reverse()
    .find((row) => rowNumber(row, "TP_DK_USD_A_YTL") && rowNumber(row, "TP_DK_EUR_A_YTL"));

  return normalizeRates({
    usd: rowNumber(last, "TP_DK_USD_A_YTL"),
    eur: rowNumber(last, "TP_DK_EUR_A_YTL"),
    source: "TCMB-EVDS",
  });
}

export async function fetchTodayXmlRates({ warning = null } = {}) {
  const response = await fetchWithTimeout("https://www.tcmb.gov.tr/kurlar/today.xml");
  if (!response.ok) {
    throw new Error(`TCMB today.xml başarısız: ${response.status}`);
  }

  const xml = await response.text();
  const usd = numeric(xml.match(/Kod="USD"[\s\S]*?<ForexBuying>([\d.]+)<\/ForexBuying>/)?.[1]);
  const eur = numeric(xml.match(/Kod="EUR"[\s\S]*?<ForexBuying>([\d.]+)<\/ForexBuying>/)?.[1]);

  return normalizeRates({
    usd,
    eur,
    source: "TCMB-live-XML",
    warning,
  });
}

export async function getRatesWithCache() {
  if (memoryRates && Date.now() - new Date(memoryRates.fetchedAt).getTime() < HOUR_MS) {
    return memoryRates;
  }

  if (process.env.TCMB_EVDS_API_KEY) {
    try {
      memoryRates = await fetchEvdsRates();
      return memoryRates;
    } catch {
      try {
        memoryRates = await fetchTodayXmlRates();
        return memoryRates;
      } catch (xmlError) {
        if (memoryRates) {
          return {
            ...memoryRates,
            stale: true,
            warning: `Canlı TCMB XML bağlantısı kurulamadı: ${xmlError.message}`,
          };
        }

        throw new Error(`TCMB XML kaynağı kullanılamıyor: ${xmlError.message}`);
      }
    }
  }

  try {
    memoryRates = await fetchTodayXmlRates();
    return memoryRates;
  } catch (xmlError) {
    if (memoryRates) {
      return {
        ...memoryRates,
        stale: true,
        warning: `Canlı TCMB XML bağlantısı kurulamadı: ${xmlError.message}`,
      };
    }

    throw new Error(`TCMB XML kaynağı kullanılamıyor: ${xmlError.message}`);
  }
}
