import { useEffect, useState } from "react";
import {
  calculateCarbonChain,
  type CarbonChainResponse,
  type TransportMode,
} from "@/lib/api-client";
import type { VehicleType } from "@/lib/sample-listings";

interface CarbonChainInput {
  from: [number, number];
  to: [number, number];
  weightTon: number;
  mode: TransportMode | VehicleType;
}

export function useCarbonChain(input: CarbonChainInput) {
  const [data, setData] = useState<CarbonChainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromLng, fromLat] = input.from;
  const [toLng, toLat] = input.to;
  const { weightTon, mode } = input;

  useEffect(() => {
    let active = true;
    setLoading(true);

    calculateCarbonChain({
      from: [fromLng, fromLat],
      to: [toLng, toLat],
      weightTon,
      mode,
    })
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Karbon zinciri hesaplanamadı.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fromLng, fromLat, toLng, toLat, weightTon, mode]);

  return { data, error, loading };
}
