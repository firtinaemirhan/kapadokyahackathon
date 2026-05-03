import type { VehicleType } from "./sample-listings";

export type TransportVehicle = Exclude<VehicleType, "buyer">;

// ---------- Distance ----------
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Road distance estimate when ORS isn't available — apply a winding factor
export function estimateRoadKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  vehicle: VehicleType = "truck",
) {
  const direct = haversineKm(a, b);
  const mode = effectiveTransportVehicle(vehicle);
  const factor = mode === "sea" ? 1.6 : mode === "rail" ? 1.25 : 1.32;
  return direct * factor;
}

// ---------- Carbon (kg CO2) ----------
// Emission factors (kg CO2 per ton-km) — UN/IPCC averages, simplified
export const EMISSION_FACTORS: Record<VehicleType, number> = {
  truck: 0.1,
  van: 0.1,
  rail: 0.03,
  sea: 0.015,
  buyer: 0.1,
};

export const DEFAULT_CARBON_PRICE_TRY_PER_TON = 350;

export function effectiveTransportVehicle(
  vehicle: VehicleType,
  fallback: TransportVehicle = "truck",
): TransportVehicle {
  return vehicle === "buyer" ? fallback : vehicle;
}

export function carbonKg(tonnage: number, km: number, vehicle: VehicleType) {
  return tonnage * km * EMISSION_FACTORS[effectiveTransportVehicle(vehicle)];
}

// Equivalent: kg CO2 absorbed by ~21 kg per tree per year
export function treesEquivalent(kgCo2: number) {
  return Math.max(1, Math.round(kgCo2 / 21));
}

// ---------- Currency / Export Badge ----------
export type ExportBadge = "strong" | "watch" | "risk";

export function exportBadge(
  usdTry: number,
  dailyChangePct: number,
): {
  level: ExportBadge;
  label: string;
  reason: string;
} {
  // Simple rule engine: if TRY weakens (USD up) -> exporter margin grows
  if (dailyChangePct >= 0.4) {
    return {
      level: "strong",
      label: "Marj Güçlü",
      reason: `USD ${dailyChangePct.toFixed(2)}% ↑ — ihracat marjı bugün avantajlı.`,
    };
  }
  if (dailyChangePct <= -0.4) {
    return {
      level: "risk",
      label: "Kur Riski",
      reason: `USD ${dailyChangePct.toFixed(2)}% ↓ — ihracatı ertelemek mantıklı.`,
    };
  }
  return {
    level: "watch",
    label: "Marj İzlenmeli",
    reason: `USD ${usdTry.toFixed(2)} stabil — pozisyonu takip edin.`,
  };
}

// Transport cost estimate (TRY per ton-km) — rough Turkish logistics rates 2024
export const TRANSPORT_RATE_TRY_PER_TON_KM: Record<VehicleType, number> = {
  truck: 1.2,
  van: 1.5,
  rail: 0.45,
  sea: 0.28,
  buyer: 0,
};

export function transportCostTRY(tonnage: number, km: number, vehicle: VehicleType): number {
  return tonnage * km * transportRateTRYPerTonKm(vehicle);
}

export function transportRateTRYPerTonKm(vehicle: VehicleType): number {
  return TRANSPORT_RATE_TRY_PER_TON_KM[effectiveTransportVehicle(vehicle)];
}

export function calculateTradeEstimate(input: {
  quantityTon: number;
  unitPriceTRY: number;
  distanceKm: number;
  vehicle: VehicleType;
  includeTransport?: boolean;
}) {
  const quantityTon = Math.max(0, Number(input.quantityTon) || 0);
  const unitPriceTRY = Math.max(0, Number(input.unitPriceTRY) || 0);
  const distanceKm = Math.max(0, Number(input.distanceKm) || 0);
  const vehicle = effectiveTransportVehicle(input.vehicle);
  const tonKm = quantityTon * distanceKm;
  const materialTotalTRY = quantityTon * unitPriceTRY;
  const transportRateTRY = transportRateTRYPerTonKm(vehicle);
  const transportCostTRY = input.includeTransport === false ? 0 : tonKm * transportRateTRY;
  const co2Kg = carbonKg(quantityTon, distanceKm, vehicle);

  return {
    quantityTon,
    unitPriceTRY,
    distanceKm,
    vehicle,
    tonKm,
    materialTotalTRY,
    transportRateTRY,
    transportCostTRY,
    totalCostTRY: materialTotalTRY + transportCostTRY,
    co2Kg,
  };
}

export function fmtTRY(v: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(v);
}

export function fmtUSD(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

export type DisplayCurrency = "TRY" | "USD" | "EUR";

export function fmtCurrency(v: number, currency: DisplayCurrency, maximumFractionDigits = 0) {
  return new Intl.NumberFormat(currency === "TRY" ? "tr-TR" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(v);
}
