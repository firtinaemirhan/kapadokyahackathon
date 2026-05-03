import { useEffect, useState } from "react";
import { getExchangeRates } from "@/lib/api-client";

export interface FxState {
  usdTry: number;
  eurTry: number;
  dailyChangePct: number; // for USD/TRY
  source: string;
  loading: boolean;
  asOf: string;
  stale: boolean;
  error: string | null;
  available: boolean;
}

async function fetchFx(): Promise<Omit<FxState, "loading">> {
  try {
    const rates = await getExchangeRates();
    return {
      usdTry: rates.USD_TRY,
      eurTry: rates.EUR_TRY,
      dailyChangePct: 0,
      source: rates.source,
      asOf: rates.fetchedAt,
      stale: Boolean(rates.stale),
      error: rates.warning ?? null,
      available: true,
    };
  } catch (err) {
    return {
      usdTry: 0,
      eurTry: 0,
      dailyChangePct: 0,
      source: "backend-unavailable",
      asOf: new Date().toISOString(),
      stale: true,
      error: err instanceof Error ? err.message : "TCMB kuru alınamadı.",
      available: false,
    };
  }
}

export function useFxRate(): FxState {
  const [state, setState] = useState<FxState>({
    usdTry: 0,
    eurTry: 0,
    dailyChangePct: 0,
    source: "loading",
    loading: true,
    asOf: new Date().toISOString(),
    stale: false,
    error: null,
    available: false,
  });

  useEffect(() => {
    let mounted = true;
    fetchFx().then((r) => {
      if (mounted) setState({ ...r, loading: false });
    });
    const id = setInterval(() => {
      fetchFx().then((r) => mounted && setState({ ...r, loading: false }));
    }, 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return state;
}
