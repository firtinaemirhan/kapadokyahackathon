import { fetchWithTimeout } from "./network.js";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

function userAgent() {
  return process.env.NOMINATIM_USER_AGENT || "Tortu/1.0 (info@tortu.app)";
}

export async function geocodeAddress(query) {
  const q = String(query ?? "").trim();
  if (q.length < 3) {
    throw new Error("Adres araması için en az 3 karakter gerekli.");
  }

  const url = new URL(`${NOMINATIM_URL}/search`);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "tr");

  const response = await fetchWithTimeout(url, { headers: { "User-Agent": userAgent() } });
  if (!response.ok) {
    throw new Error(`Nominatim başarısız: ${response.status}`);
  }

  const first = (await response.json())?.[0];
  if (!first) {
    throw new Error("Adres bulunamadı.");
  }

  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
    display: String(first.display_name),
    source: "Nominatim",
  };
}

export async function reverseGeocode(lat, lng) {
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
    throw new Error("Lat/lng sayısal olmalı.");
  }

  const url = new URL(`${NOMINATIM_URL}/reverse`);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "json");

  const response = await fetchWithTimeout(url, { headers: { "User-Agent": userAgent() } });
  if (!response.ok) {
    throw new Error(`Nominatim reverse başarısız: ${response.status}`);
  }

  const data = await response.json();
  return {
    lat: Number(lat),
    lng: Number(lng),
    display: String(data?.display_name ?? `${lat}, ${lng}`),
    source: "Nominatim",
  };
}
