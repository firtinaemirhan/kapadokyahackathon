import { useState } from "react";
import { MapPin, Navigation, ChevronDown, LocateFixed, LoaderCircle, Search } from "lucide-react";
import type { UserLocation } from "@/hooks/useUserLocation";
import { geocodeAddress } from "@/lib/api-client";

interface Props {
  location: UserLocation;
  gpsStatus: "idle" | "pending" | "ok" | "denied";
  onRequestGps: () => void;
  onSetLocation: (loc: UserLocation) => void;
  distanceKm?: number;
  label?: string;
}

export function LocationPicker({
  location,
  gpsStatus,
  onRequestGps,
  onSetLocation,
  distanceKm,
  label = "Konumunuz",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const searchAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextQuery = query.trim();
    if (nextQuery.length < 3) {
      setSearchStatus("En az 3 karakter girin.");
      return;
    }

    setSearching(true);
    setSearchStatus("Adres aranıyor...");
    try {
      const result = await geocodeAddress(nextQuery);
      onSetLocation({
        lat: result.lat,
        lng: result.lng,
        label: result.display.split(",").slice(0, 2).join(", ") || nextQuery,
        source: "search",
      });
      setSearchStatus(`${result.source}: ${result.display}`);
      setOpen(false);
    } catch (error) {
      setSearchStatus(error instanceof Error ? error.message : "Adres bulunamadı.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
              {label}
            </div>
            <div className="font-semibold leading-tight flex items-center gap-1.5">
              {location.label}
              {location.source === "gps" && (
                <span className="text-[10px] px-1.5 py-0.5 bg-primary/15 text-primary rounded font-semibold">
                  GPS
                </span>
              )}
              {location.source === "search" && (
                <span className="text-[10px] px-1.5 py-0.5 bg-primary/15 text-primary rounded font-semibold">
                  ADRES
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {distanceKm !== undefined && (
            <span className="text-muted-foreground font-mono text-sm font-semibold">
              {distanceKm.toFixed(0)} km
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-border/60 pt-3 space-y-3">
          <button
            type="button"
            onClick={() => {
              onRequestGps();
              if (gpsStatus === "ok") setOpen(false);
            }}
            disabled={gpsStatus === "pending"}
            className="flex w-full items-center gap-2 px-3 py-2.5 rounded-md border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 disabled:opacity-50 transition-colors"
          >
            <LocateFixed className="w-4 h-4 shrink-0" />
            {gpsStatus === "pending"
              ? "Konum alınıyor..."
              : gpsStatus === "denied"
                ? "GPS izni reddedildi — tarayıcı ayarlarından açın"
                : "GPS Konumumu Kullan"}
          </button>

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              veya adres ara
            </div>
            <form onSubmit={searchAddress} className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Adres, OSB, ilçe veya tesis ara..."
                  className="w-full rounded-md border border-border bg-background py-2 pl-8 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="inline-flex min-w-20 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {searching ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
                Ara
              </button>
            </form>
            {searchStatus ? (
              <div
                className={`rounded-md px-3 py-2 text-xs ${
                  searchStatus.includes("bulunamadı") || searchStatus.includes("girin")
                    ? "bg-[var(--danger)]/10 text-[var(--danger)]"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {searchStatus}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Navigation className="w-3 h-3" />
            Seçiminiz bu oturumdaki fiyat, rota ve karbon hesaplarını günceller.
          </div>
        </div>
      )}
    </div>
  );
}
