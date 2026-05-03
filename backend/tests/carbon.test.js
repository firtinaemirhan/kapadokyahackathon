import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { calculateCarbonCost, calculateCo2Kg, normalizeTransportMode } from "../services/carbon.js";
import { haversineKm, isValidLngLat } from "../services/geo.js";
import { fallbackClassify } from "../services/classify-waste.js";
import { clearRouteDistanceCache, getDistanceKm } from "../services/route-distance.js";

const originalFetch = globalThis.fetch;
const originalOrsApiKey = process.env.ORS_API_KEY;

afterEach(() => {
  globalThis.fetch = originalFetch;
  clearRouteDistanceCache();
  if (originalOrsApiKey === undefined) {
    delete process.env.ORS_API_KEY;
  } else {
    process.env.ORS_API_KEY = originalOrsApiKey;
  }
});

test("docx emisyon faktörleriyle CO2 hesaplar", () => {
  assert.equal(calculateCo2Kg(0, 10, "road"), 0);
  assert.equal(calculateCo2Kg(100, 10, "road"), 100);
  assert.equal(calculateCo2Kg(100, 10, "rail"), 30);
  assert.equal(calculateCo2Kg(100, 10, "sea"), 15);
  assert.equal(calculateCo2Kg(100, 10, "air"), 500);
});

test("frontend taşıma adlarını backend modlarına eşler", () => {
  assert.equal(normalizeTransportMode("truck"), "road");
  assert.equal(normalizeTransportMode("van"), "road");
  assert.equal(normalizeTransportMode("rail"), "rail");
});

test("karbon maliyetini TCMB kurlarıyla hedef dövizlere çevirir", () => {
  assert.deepEqual(calculateCarbonCost(1000, { USD_TRY: 40, EUR_TRY: 50 }, 350), {
    TRY: 350,
    USD: 8.75,
    EUR: 7,
  });
});

test("coğrafi yardımcılar geçerli koordinat ve mesafe üretir", () => {
  assert.equal(isValidLngLat([34.85, 38.71]), true);
  assert.equal(isValidLngLat([200, 38.71]), false);
  assert.ok(haversineKm([34.85, 38.71], [35.49, 38.74]) > 40);
});

test("AI servisi yokken Türkçe keyword fallback kategori önerir", () => {
  const [first] = fallbackClassify("Avanos seramik çömlek kırığı");
  assert.equal(first.slug, "ceramic");
  assert.ok(first.score > 0.8);
});

test("karayolu rotasında OSRM mesafesi ve yol geometrisi kullanır", async () => {
  delete process.env.ORS_API_KEY;
  globalThis.fetch = async (url) => {
    assert.ok(String(url).startsWith("https://router.project-osrm.org/route/v1/driving/"));
    assert.ok(String(url).includes("overview=full"));
    return {
      ok: true,
      json: async () => ({
        routes: [
          {
            distance: 81234,
            duration: 5000,
            geometry: {
              coordinates: [
                [34.85, 38.71],
                [35.1, 38.82],
                [35.49, 38.74],
              ],
            },
          },
        ],
      }),
    };
  };

  const result = await getDistanceKm([34.85, 38.71], [35.49, 38.74], "road", {
    includeGeometry: true,
  });

  assert.equal(result.source, "OSRM");
  assert.equal(result.dynamic, true);
  assert.equal(result.distanceKm, 81.23);
  assert.equal(result.durationMin, 83);
  assert.deepEqual(result.routeGeometry, [
    [34.85, 38.71],
    [35.1, 38.82],
    [35.49, 38.74],
  ]);
});

test("rota servisi başarısızsa fallback rotayı açıkça işaretler", async () => {
  delete process.env.ORS_API_KEY;
  globalThis.fetch = async () => {
    throw new Error("network down");
  };

  const result = await getDistanceKm([34.85, 38.71], [35.49, 38.74], "road", {
    includeGeometry: true,
  });

  assert.equal(result.source, "haversine-fallback");
  assert.equal(result.dynamic, false);
  assert.ok(result.distanceKm > haversineKm([34.85, 38.71], [35.49, 38.74]));
  assert.deepEqual(result.routeGeometry, [
    [34.85, 38.71],
    [35.49, 38.74],
  ]);
});
