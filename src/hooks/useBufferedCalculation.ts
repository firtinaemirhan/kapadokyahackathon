import { useEffect, useState } from "react";

const DEFAULT_BUFFER_MS = 6500;

export function useBufferedCalculation(
  calculationKey: string,
  externalLoading = false,
  bufferMs = DEFAULT_BUFFER_MS,
) {
  const [readyKey, setReadyKey] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setReadyKey(calculationKey), bufferMs);
    return () => window.clearTimeout(timeout);
  }, [bufferMs, calculationKey]);

  return externalLoading || readyKey !== calculationKey;
}
