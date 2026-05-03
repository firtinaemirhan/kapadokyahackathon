import { haversineKm } from "@/lib/geo";
import type { TransportMode } from "@/lib/types";

type DistanceResult = {
  distanceKm: number;
  durationMin?: number;
  source: string;
  expires?: number;
};

const cache = new Map<string, DistanceResult>();
const DAY_MS = 86_400_000;

function cacheKey(from: [number, number], to: [number, number], mode: TransportMode) {
  return `${mode}:${from.map((x) => x.toFixed(4)).join(",")}:${to.map((x) => x.toFixed(4)).join(",")}`;
}

function fallbackDistance(
  from: [number, number],
  to: [number, number],
  mode: TransportMode,
  source = "haversine-fallback",
): DistanceResult {
  const factor = mode === "road" ? 1.3 : mode === "rail" ? 1.2 : 1;
  return {
    distanceKm: haversineKm([from[1], from[0]], [to[1], to[0]]) * factor,
    source,
  };
}

async function fetchOpenRouteServiceDistance(
  from: [number, number],
  to: [number, number],
): Promise<DistanceResult> {
  const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-hgv", {
    method: "POST",
    headers: {
      Authorization: process.env.ORS_API_KEY ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ coordinates: [from, to] }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`ORS ${res.status}`);
  const data = await res.json();
  const meters = data.routes?.[0]?.summary?.distance;
  const seconds = data.routes?.[0]?.summary?.duration;
  if (!meters) throw new Error("invalid ORS payload");

  return {
    distanceKm: meters / 1000,
    durationMin: seconds ? Math.round(seconds / 60) : undefined,
    source: "OpenRouteService",
  };
}

async function fetchOsrmDistance(
  from: [number, number],
  to: [number, number],
): Promise<DistanceResult> {
  const coordinates = `${from.join(",")};${to.join(",")}`;
  const params = new URLSearchParams({
    overview: "false",
    alternatives: "false",
    steps: "false",
  });
  const res = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${coordinates}?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!res.ok) throw new Error(`OSRM ${res.status}`);
  const data = await res.json();
  const route = data.routes?.[0];
  if (!route?.distance) throw new Error("invalid OSRM payload");

  return {
    distanceKm: route.distance / 1000,
    durationMin: route.duration ? Math.round(route.duration / 60) : undefined,
    source: "OSRM",
  };
}

export async function getDistanceKm(
  from: [number, number],
  to: [number, number],
  mode: TransportMode,
) {
  const key = cacheKey(from, to, mode);
  const c = cache.get(key);
  if (c?.expires && c.expires > Date.now()) return c;

  let result: DistanceResult | null = null;

  if (mode === "road") {
    if (process.env.ORS_API_KEY) {
      try {
        result = await fetchOpenRouteServiceDistance(from, to);
      } catch {
        result = null;
      }
    }

    if (!result) {
      try {
        result = await fetchOsrmDistance(from, to);
      } catch {
        result = fallbackDistance(from, to, mode);
      }
    }
  }

  if (!result) {
    result = fallbackDistance(from, to, mode, mode === "road" ? "haversine-fallback" : "haversine");
  }

  const cached = { ...result, expires: Date.now() + DAY_MS };
  cache.set(key, cached);
  return cached;
}
