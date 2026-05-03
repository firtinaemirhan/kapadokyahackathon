import { Router } from "express";
import {
  calculateCarbonCost,
  calculateCo2Kg,
  DEFAULT_CARBON_PRICE_TRY_PER_TON,
  EMISSION_FACTORS,
  normalizeTransportMode,
  round,
} from "../services/carbon.js";
import { getDistanceKm } from "../services/route-distance.js";
import { getRatesWithCache } from "../services/tcmb.js";

export const carbonRouter = Router();

carbonRouter.post("/calculate", async (req, res, next) => {
  try {
    res.json(await calculateCarbonChain(req.body ?? {}));
  } catch (error) {
    next(error);
  }
});

export async function calculateCarbonChain(payload) {
  const {
    from,
    to,
    weightTon,
    mode = "road",
    carbonPriceTryPerTon = DEFAULT_CARBON_PRICE_TRY_PER_TON,
  } = payload;
  const transportMode = normalizeTransportMode(mode);
  const [distance, rates] = await Promise.all([
    getDistanceKm(from, to, transportMode),
    getRatesWithCache(),
  ]);
  const co2Kg = calculateCo2Kg(distance.distanceKm, Number(weightTon), transportMode);
  const carbonCost = calculateCarbonCost(co2Kg, rates, carbonPriceTryPerTon);

  return {
    distanceKm: distance.distanceKm,
    durationMin: distance.durationMin,
    weightTon: Number(weightTon),
    mode: transportMode,
    emissionFactor: EMISSION_FACTORS[transportMode],
    co2Kg: round(co2Kg, 2),
    carbonCost,
    exchangeRate: rates,
    sources: {
      distance: distance.source,
      rates: rates.source,
    },
    warnings: [
      rates.warning,
      distance.dynamic
        ? null
        : "OpenRouteService yok veya başarısız; mesafe haversine fallback ile hesaplandı.",
    ].filter(Boolean),
    chain: ["geo", "carbon", "fx"],
  };
}
