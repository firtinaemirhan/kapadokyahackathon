import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getLiveApiTests, type LiveApiTestResponse } from "@/lib/api-client";

export const Route = createFileRoute("/api-status")({
  head: () => ({
    meta: [
      { title: "Canlı API Durumu — Tortu" },
      {
        name: "description",
        content: "TCMB, rota, geocode ve Supabase bağlantılarının canlı veri testleri.",
      },
    ],
  }),
  component: ApiStatusPage,
});

function ApiStatusPage() {
  const [data, setData] = useState<LiveApiTestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getLiveApiTests());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Canlı API testi alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Dış bağlantı testi
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight">
            Canlı API Durumu
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Bu sayfa demo verisi göstermeden backend üzerinden canlı kaynaklara istek atar ve hangi
            kaynakların gerçekten cevap verdiğini listeler.
          </p>
        </div>
        <button
          type="button"
          onClick={loadStatus}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Yeniden Test Et
        </button>
      </div>

      {error && (
        <div className="mt-8 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm">
          {error}
        </div>
      )}

      <div className="mt-10 grid gap-4">
        {(data?.checks ?? []).map((check) => (
          <article
            key={check.id}
            className="rounded-lg border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 font-display text-2xl font-semibold">
                  {check.ok ? (
                    <CheckCircle2 className="h-5 w-5 text-[var(--moss)]" />
                  ) : (
                    <XCircle className="h-5 w-5 text-[var(--danger)]" />
                  )}
                  {check.name}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Kaynak: <span className="font-mono">{check.source}</span>
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                {check.durationMs} ms
              </span>
            </div>

            {check.sample && <p className="mt-4 text-sm">{check.sample}</p>}
            {check.warning && (
              <p className="mt-3 rounded-md bg-secondary p-3 text-sm text-muted-foreground">
                {check.warning}
              </p>
            )}
          </article>
        ))}
      </div>

      {loading && !data && (
        <div className="mt-10 rounded-lg border border-border/60 bg-card p-6 text-muted-foreground">
          Canlı kaynaklar test ediliyor...
        </div>
      )}

      {data && (
        <p className="mt-6 text-xs text-muted-foreground">
          Son kontrol: {new Date(data.completedAt).toLocaleString("tr-TR")}
        </p>
      )}
    </div>
  );
}
