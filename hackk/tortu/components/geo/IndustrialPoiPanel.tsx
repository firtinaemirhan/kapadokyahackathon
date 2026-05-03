"use client";

import * as React from "react";
import { Factory, Loader2, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Poi = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: string;
};

export function IndustrialPoiPanel() {
  const [pois, setPois] = React.useState<Poi[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function searchPois() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/overpass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: 38.7205, lng: 35.4826, radius: 50000 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Overpass sorgusu başarısız");
      setPois(data.pois ?? []);
    } catch (event) {
      setError(event instanceof Error ? event.message : "Overpass sorgusu başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <Factory className="h-4 w-4" />
            Bağımsız coğrafi veri
          </div>
          <h2 className="mt-2 font-serif text-2xl font-semibold">Kayseri çevresi sanayi alanları</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Bu panel karbon hesabından ayrı çalışır ve Overpass API ile yakındaki endüstriyel alıcı kümelerini arar.
          </p>
        </div>
        <Button onClick={searchPois} disabled={loading} variant="outline">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPinned className="h-4 w-4" />}
          OSB Ara
        </Button>
      </div>
      {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {pois.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {pois.slice(0, 6).map((poi) => (
            <div key={poi.id} className="rounded-md bg-stone-100 p-3 text-sm">
              <b>{poi.name}</b>
              <p className="mt-1 text-xs text-stone-600">
                {poi.kind} · {poi.lat.toFixed(3)}, {poi.lng.toFixed(3)}
              </p>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && pois.length === 0 && (
        <p className="mt-4 text-xs text-stone-500">Demo için butona basınca gerçek Overpass isteği tetiklenir; fallback kullanılmaz.</p>
      )}
    </Card>
  );
}
