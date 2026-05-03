export const EMISSION_FACTORS = {
  air: { label: "Hava Kargo", factor: 0.5 },
  sea: { label: "Deniz Yolu", factor: 0.015 },
  road: { label: "Kara (TIR)", factor: 0.1 },
  rail: { label: "Demiryolu", factor: 0.03 },
};

export const DEFAULT_CARBON_PRICE_TRY_PER_TON = 350;

export function normalizeTransportMode(mode = "road") {
  const normalized = String(mode).toLowerCase();
  const aliases = {
    truck: "road",
    van: "road",
    buyer: "road",
    lorry: "road",
    railway: "rail",
    train: "rail",
    ship: "sea",
    ocean: "sea",
    plane: "air",
  };

  return aliases[normalized] ?? normalized;
}

export function calculateCo2Kg(distanceKm, weightTon, mode = "road") {
  const transportMode = normalizeTransportMode(mode);
  const factor = EMISSION_FACTORS[transportMode]?.factor;

  if (!factor) {
    throw new Error(`Desteklenmeyen taşıma modu: ${mode}`);
  }
  if (!Number.isFinite(Number(distanceKm)) || Number(distanceKm) < 0) {
    throw new Error("Mesafe sıfır veya pozitif sayı olmalı.");
  }
  if (!Number.isFinite(Number(weightTon)) || Number(weightTon) <= 0) {
    throw new Error("Ağırlık ton cinsinden pozitif sayı olmalı.");
  }

  return Number(distanceKm) * Number(weightTon) * factor;
}

export function calculateCarbonCost(
  co2Kg,
  rates,
  carbonPriceTryPerTon = DEFAULT_CARBON_PRICE_TRY_PER_TON,
) {
  const price = Number(carbonPriceTryPerTon);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Karbon fiyatı pozitif sayı olmalı.");
  }

  const tryCost = (Number(co2Kg) / 1000) * price;
  return {
    TRY: round(tryCost, 2),
    USD: round(tryCost / rates.USD_TRY, 2),
    EUR: round(tryCost / rates.EUR_TRY, 2),
  };
}

export function round(value, digits = 2) {
  return Number(Number(value).toFixed(digits));
}
