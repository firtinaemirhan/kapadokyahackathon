import { haversineKm, normalizeLngLat } from "./geo.js";
import { normalizeTransportMode, round } from "./carbon.js";
import { fetchWithTimeout } from "./network.js";

const routeCache = new Map();
const DAY_MS = 24 * 60 * 60 * 1000;

function cacheKey(from, to, mode, includeGeometry) {
  return `${mode}:${includeGeometry ? "geometry" : "distance"}:${from.map((x) => x.toFixed(4)).join(",")}:${to.map((x) => x.toFixed(4)).join(",")}`;
}

function normalizeRouteGeometry(coordinates) {
  if (!Array.isArray(coordinates)) return null;

  const geometry = coordinates
    .filter((point) => Array.isArray(point) && point.length >= 2)
    .map((point) => [Number(point[0]), Number(point[1])])
    .filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]));

  return geometry.length >= 2 ? geometry : null;
}

function withGeometry(result, geometry, includeGeometry) {
  if (!includeGeometry) return result;
  const routeGeometry = normalizeRouteGeometry(geometry);
  return routeGeometry ? { ...result, routeGeometry } : result;
}

function fallbackDistance(from, to, mode, source = "haversine-fallback", includeGeometry = false) {
  const factor = mode === "road" ? 1.3 : mode === "rail" ? 1.2 : 1;
  return withGeometry(
    {
      distanceKm: haversineKm(from, to) * factor,
      durationMin: null,
      source,
      dynamic: false,
    },
    [from, to],
    includeGeometry,
  );
}

async function fetchOsrmDistance(from, to, includeGeometry) {
  const coordinates = `${from.join(",")};${to.join(",")}`;
  const params = new URLSearchParams({
    overview: includeGeometry ? "full" : "false",
    geometries: "geojson",
    alternatives: "false",
    steps: "false",
  });
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?${params.toString()}`;
  const response = await fetchWithTimeout(url, undefined, 9000);

  if (!response.ok) {
    throw new Error(`OSRM ${response.status}`);
  }

  const data = await response.json();
  const route = data?.routes?.[0];
  if (!route?.distance) {
    throw new Error("OSRM yanıtı mesafe içermiyor.");
  }

  return withGeometry(
    {
      distanceKm: route.distance / 1000,
      durationMin: route.duration ? Math.round(route.duration / 60) : null,
      source: "OSRM",
      dynamic: true,
    },
    route.geometry?.coordinates,
    includeGeometry,
  );
}

async function fetchOpenRouteServiceDistance(from, to, includeGeometry) {
  const response = await fetchWithTimeout(
    `https://api.openrouteservice.org/v2/directions/driving-hgv${includeGeometry ? "/geojson" : ""}`,
    {
      method: "POST",
      headers: {
        Authorization: process.env.ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coordinates: [from, to] }),
    },
    9000,
  );

  if (!response.ok) {
    throw new Error(`ORS ${response.status}`);
  }

  const data = await response.json();
  const summary = includeGeometry
    ? data?.features?.[0]?.properties?.summary
    : data?.routes?.[0]?.summary;
  const meters = summary?.distance;
  const seconds = summary?.duration;

  if (!meters) {
    throw new Error("ORS yanıtı mesafe içermiyor.");
  }

  return withGeometry(
    {
      distanceKm: meters / 1000,
      durationMin: seconds ? Math.round(seconds / 60) : null,
      source: "OpenRouteService",
      dynamic: true,
    },
    data?.features?.[0]?.geometry?.coordinates,
    includeGeometry,
  );
}

export async function getDistanceKm(fromInput, toInput, requestedMode = "road", options = {}) {
  const from = normalizeLngLat(fromInput);
  const to = normalizeLngLat(toInput);
  const mode = normalizeTransportMode(requestedMode);
  const includeGeometry = Boolean(options.includeGeometry);
  const key = cacheKey(from, to, mode, includeGeometry);
  const cached = routeCache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  let value = null;
  if (mode === "road") {
    if (process.env.ORS_API_KEY) {
      try {
        value = await fetchOpenRouteServiceDistance(from, to, includeGeometry);
      } catch {
        value = null;
      }
    }

    if (!value) {
      try {
        value = await fetchOsrmDistance(from, to, includeGeometry);
      } catch {
        value = fallbackDistance(from, to, mode, "haversine-fallback", includeGeometry);
      }
    }
  }

  if (!value) {
    value = fallbackDistance(from, to, mode, "haversine", includeGeometry);
  }

  const rounded = {
    ...value,
    mode,
    distanceKm: round(value.distanceKm, 2),
  };
  routeCache.set(key, { value: rounded, expiresAt: Date.now() + DAY_MS });
  return rounded;
}

export function clearRouteDistanceCache() {
  routeCache.clear();
}
