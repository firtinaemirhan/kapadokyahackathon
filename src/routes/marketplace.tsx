import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import { ListingsMap } from "@/components/ListingsMap";
import { useFxRate } from "@/hooks/useFxRate";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useBufferedCalculation } from "@/hooks/useBufferedCalculation";
import {
  calculateCarbonChain,
  deleteListing,
  getListings,
  type CarbonChainResponse,
} from "@/lib/api-client";
import { SAMPLE_LISTINGS, CATEGORY_LABELS, type WasteCategory } from "@/lib/sample-listings";
import {
  calculateTradeEstimate,
  effectiveTransportVehicle,
  estimateRoadKm,
  exportBadge,
} from "@/lib/tortu-utils";
import { Search, Leaf, Truck, Coins, ShoppingCart, Package, MapPin } from "lucide-react";
import type { ListingType } from "@/lib/sample-listings";
import { LocationPicker } from "@/components/LocationPicker";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Pazaryeri — Tortu" },
      {
        name: "description",
        content:
          "Aktif Kapadokya atık ilanlarını fiyat, mesafe ve karbon emisyonuna göre filtreleyin. Harita üzerinden bölgesel keşif.",
      },
      { property: "og:title", content: "Tortu Pazaryeri" },
      {
        property: "og:description",
        content: "Atık ilanları · Karbon optimizasyonu · ESG satın alım.",
      },
    ],
  }),
  component: MarketplacePage,
});

type SortMode = "carbon" | "distance" | "price" | "newest";

function MarketplacePage() {
  const fx = useFxRate();
  const { location: buyerLoc, gpsStatus, requestGps, setLocation } = useUserLocation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<WasteCategory | "all">("all");
  const [listingTypeFilter, setListingTypeFilter] = useState<ListingType | "all">("all");
  const [sort, setSort] = useState<SortMode>("carbon");
  const [hoverId, setHoverId] = useState<string | undefined>();
  const [chains, setChains] = useState<Record<string, CarbonChainResponse>>({});
  const [chainsLoading, setChainsLoading] = useState(true);
  const [chainError, setChainError] = useState<string | null>(null);
  const [listings, setListings] = useState(SAMPLE_LISTINGS);
  const [listingStatus, setListingStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getListings()
      .then((result) => {
        if (!active) return;
        const remoteListings = result.listings ?? [];
        setListings([...remoteListings, ...SAMPLE_LISTINGS]);
        setListingStatus(result.warning ?? null);
      })
      .catch((error) => {
        if (!active) return;
        setListings(SAMPLE_LISTINGS);
        setListingStatus(error instanceof Error ? error.message : "İlanlar alınamadı.");
      });

    return () => {
      active = false;
    };
  }, []);

  // Recalculate carbon chains whenever listings or buyer location changes
  useEffect(() => {
    let active = true;
    setChainsLoading(true);
    setChainError(null);
    Promise.allSettled(
      listings.map(async (listing) => {
        const chain = await calculateCarbonChain({
          from: [listing.lng, listing.lat],
          to: [buyerLoc.lng, buyerLoc.lat],
          weightTon: listing.tonnage,
          mode: effectiveTransportVehicle(listing.vehicle),
        });
        return [listing.id, chain] as const;
      }),
    )
      .then((results) => {
        if (!active) return;
        const fulfilled = results
          .filter(
            (result): result is PromiseFulfilledResult<readonly [string, CarbonChainResponse]> =>
              result.status === "fulfilled",
          )
          .map((result) => result.value);
        const failedCount = results.length - fulfilled.length;

        setChains(Object.fromEntries(fulfilled));
        setChainError(
          failedCount > 0
            ? `${failedCount} ilan için canlı karbon zinciri alınamadı; tahmini fallback gösteriliyor.`
            : null,
        );
        setChainsLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setChainError(err instanceof Error ? err.message : "Canlı karbon zinciri alınamadı.");
        setChainsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [listings, buyerLoc.lat, buyerLoc.lng]);

  const marketplaceCalculationKey = useMemo(
    () =>
      [
        buyerLoc.lat.toFixed(6),
        buyerLoc.lng.toFixed(6),
        ...listings.map((listing) =>
          [
            listing.id,
            listing.tonnage,
            listing.pricePerTonTRY,
            listing.vehicle,
            listing.lat.toFixed(6),
            listing.lng.toFixed(6),
          ].join(":"),
        ),
      ].join("|"),
    [buyerLoc.lat, buyerLoc.lng, listings],
  );
  const marketplaceIsCalculating = useBufferedCalculation(marketplaceCalculationKey, chainsLoading);

  const enriched = useMemo(() => {
    return listings.map((l, i) => {
      const chain = chains[l.id];
      const km = chain?.distanceKm ?? estimateRoadKm(buyerLoc, l, l.vehicle);
      const estimate = calculateTradeEstimate({
        quantityTon: l.tonnage,
        unitPriceTRY: l.pricePerTonTRY,
        distanceKm: km,
        vehicle: l.vehicle,
      });
      const co2 = chain?.co2Kg ?? estimate.co2Kg;
      const badge = exportBadge(fx.usdTry, fx.dailyChangePct + ((i % 3) - 1) * 0.3);
      return { l, km, co2, badge, chain, estimate };
    });
  }, [listings, chains, fx.usdTry, fx.dailyChangePct, buyerLoc]);

  const handleDeleteListing = async (id: string) => {
    try {
      const result = await deleteListing(id);
      setListingStatus(result.warning ?? "İlan silindi.");
      setListings((current) => current.filter((listing) => listing.id !== id));
    } catch (error) {
      setListingStatus(error instanceof Error ? error.message : "İlan silinemedi.");
    }
    setChains((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const filtered = useMemo(() => {
    let out = enriched;
    if (listingTypeFilter !== "all")
      out = out.filter((x) => (x.l.listingType ?? "sell") === listingTypeFilter);
    if (category !== "all") out = out.filter((x) => x.l.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (x) =>
          x.l.title.toLowerCase().includes(q) ||
          x.l.city.toLowerCase().includes(q) ||
          x.l.seller.toLowerCase().includes(q),
      );
    }
    out = [...out].sort((a, b) => {
      if (sort === "carbon") return a.co2 - b.co2;
      if (sort === "distance") return a.km - b.km;
      if (sort === "price") return a.estimate.totalCostTRY - b.estimate.totalCostTRY;
      return new Date(b.l.createdAt).getTime() - new Date(a.l.createdAt).getTime();
    });
    return out;
  }, [enriched, category, query, sort, listingTypeFilter]);

  const totalCo2 = filtered.reduce((s, x) => s + x.co2, 0);
  const warningCount = filtered.filter((x) => x.chain?.warnings.length).length;

  return (
    <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
              Pazaryeri
            </div>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold">
              Aktif Atık İlanları
            </h1>
            <p className="mt-2 text-muted-foreground">
              {filtered.length} ilan
              {chainError ? (
                <span className="ml-2 text-xs text-[var(--warning)]">· {chainError}</span>
              ) : null}
            </p>
            <div className="mt-3 inline-flex rounded-lg border border-border/60 bg-card p-1 gap-1">
              {(
                [
                  { key: "all", label: "Tümü", Icon: Package },
                  { key: "sell", label: "Satış", Icon: Truck },
                  { key: "buy", label: "Alım Talebi", Icon: ShoppingCart },
                ] as const
              ).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setListingTypeFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    listingTypeFilter === key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* Location indicator */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border/60 rounded-lg px-3 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>
                Mesafe ve karbon: <strong className="text-foreground">{buyerLoc.label}</strong>{" "}
                konumundan
              </span>
            </div>

            {/* Sort pills */}
            <div className="flex items-center gap-2 bg-card rounded-lg p-1 border border-border/60">
              {(["carbon", "distance", "price", "newest"] as SortMode[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    sort === s
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s === "carbon" && (
                    <>
                      <Leaf className="w-3.5 h-3.5" /> Karbon
                    </>
                  )}
                  {s === "distance" && (
                    <>
                      <Truck className="w-3.5 h-3.5" /> Mesafe
                    </>
                  )}
                  {s === "price" && (
                    <>
                      <Coins className="w-3.5 h-3.5" /> Fiyat
                    </>
                  )}
                  {s === "newest" && <>En Yeni</>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Şehir, satıcı veya materyal ara..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-card border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCategory("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                category === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Tümü
            </button>
            {(Object.keys(CATEGORY_LABELS) as WasteCategory[]).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                  category === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        {/* Compact location changer in marketplace */}
        <div className="mt-4 max-w-sm">
          <LocationPicker
            location={buyerLoc}
            gpsStatus={gpsStatus}
            onRequestGps={requestGps}
            onSetLocation={setLocation}
            label="Konumunuz"
          />
        </div>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,560px)] gap-8">
        <div className="grid sm:grid-cols-2 gap-5 content-start">
          {filtered.map(({ l, km, co2, badge, chain }, i) => (
            <div
              key={l.id}
              className="h-full"
              onMouseEnter={() => setHoverId(l.id)}
              onMouseLeave={() => setHoverId(undefined)}
            >
              <ListingCard
                listing={l}
                usdTry={fx.usdTry}
                exportLevel={badge.level}
                index={i}
                logistics={
                  chain
                    ? { distanceKm: chain.distanceKm, co2Kg: chain.co2Kg }
                    : { distanceKm: km, co2Kg: co2 }
                }
                buyerLocation={buyerLoc}
                calculating={marketplaceIsCalculating || (!chain && !chainError)}
                onDelete={l.isUserCreated ? handleDeleteListing : undefined}
              />
            </div>
          ))}
          {!filtered.length && (
            <div className="col-span-full p-12 text-center text-muted-foreground rounded-lg border border-dashed border-border">
              Bu filtreye uygun ilan bulunamadı.
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 h-[600px] lg:h-[calc(100vh-7rem)] rounded-lg overflow-hidden border border-border/60 shadow-[var(--shadow-soft)]">
          <ListingsMap
            listings={filtered.map((x) => x.l)}
            highlightId={hoverId}
            buyerLocation={buyerLoc}
            className="w-full h-full"
          />
        </aside>
      </div>
    </div>
  );
}
