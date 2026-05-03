import { Router } from "express";
import { calculateCarbonChain } from "./carbon.js";
import { geocodeAddress } from "../services/geocode.js";
import { listProducts } from "../services/products.js";
import { getRatesWithCache } from "../services/tcmb.js";

export const liveTestsRouter = Router();

liveTestsRouter.get("/", async (_req, res) => {
  const startedAt = new Date().toISOString();
  const checks = await Promise.all([
    runCheck("TCMB döviz kuru", "exchange-rates", async () => {
      const rates = await getRatesWithCache();
      return {
        source: rates.source,
        fetchedAt: rates.fetchedAt,
        sample: `USD/TRY ${rates.USD_TRY.toFixed(2)} · EUR/TRY ${rates.EUR_TRY.toFixed(2)}`,
        warning: rates.warning ?? null,
      };
    }),
    runCheck("Coğrafi karbon zinciri", "geo-carbon-fx", async () => {
      const result = await calculateCarbonChain({
        from: [34.8489, 38.7156],
        to: [35.4956, 38.7392],
        weightTon: 10,
        mode: "road",
      });
      return {
        source: `${result.sources.distance} + ${result.sources.rates}`,
        sample: `${result.distanceKm} km · ${result.co2Kg} kg CO₂ · ${result.carbonCost.TRY} TRY`,
        warning: result.warnings.join(" ") || null,
      };
    }),
    runCheck("Nominatim adres testi", "geocode", async () => {
      const result = await geocodeAddress("Nevşehir, Türkiye");
      return {
        source: result.source,
        sample: `${result.lat.toFixed(4)}, ${result.lng.toFixed(4)}`,
        warning: null,
      };
    }),
    runCheck("Supabase ürün verisi", "products", async () => {
      const result = await listProducts();
      return {
        source: result.source,
        sample: `${result.products.length} ürün türü`,
        warning: result.warning ?? null,
      };
    }),
  ]);

  res.json({
    ok: checks.every((check) => check.ok),
    startedAt,
    completedAt: new Date().toISOString(),
    checks,
  });
});

async function runCheck(name, id, fn) {
  const start = Date.now();
  try {
    const details = await fn();
    return {
      id,
      name,
      ok: true,
      durationMs: Date.now() - start,
      ...details,
    };
  } catch (error) {
    return {
      id,
      name,
      ok: false,
      durationMs: Date.now() - start,
      source: "unavailable",
      sample: null,
      warning: error instanceof Error ? error.message : "Test başarısız.",
    };
  }
}
