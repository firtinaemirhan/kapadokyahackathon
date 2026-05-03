import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import type { Listing } from "@/lib/sample-listings";
import { CATEGORY_LABELS, DEFAULT_BUYER, VEHICLE_LABELS } from "@/lib/sample-listings";
import { IMAGE_MAP } from "@/lib/image-map";
import { calculateTradeEstimate, estimateRoadKm, fmtTRY, fmtUSD } from "@/lib/tortu-utils";
import { Leaf, Truck, MapPin, Trash2, ShoppingCart, LoaderCircle } from "lucide-react";

interface BuyerLocation {
  lat: number;
  lng: number;
}

interface Props {
  listing: Listing;
  usdTry: number;
  exportLevel: "strong" | "watch" | "risk";
  index?: number;
  logistics?: {
    distanceKm: number;
    co2Kg: number;
  };
  buyerLocation?: BuyerLocation;
  calculating?: boolean;
  onDelete?: (id: string) => void;
}

export function ListingCard({
  listing,
  usdTry,
  index = 0,
  logistics,
  buyerLocation,
  calculating = false,
  onDelete,
}: Props) {
  const isBuy = listing.listingType === "buy";
  const refPoint = buyerLocation ?? DEFAULT_BUYER;
  const estimatedKm = estimateRoadKm(refPoint, listing, listing.vehicle);
  const km = logistics?.distanceKm ?? estimatedKm;
  const estimate = calculateTradeEstimate({
    quantityTon: listing.tonnage,
    unitPriceTRY: listing.pricePerTonTRY,
    distanceKm: km,
    vehicle: listing.vehicle,
  });
  const co2 = logistics?.co2Kg ?? estimate.co2Kg;
  const materialTotalTRY = estimate.materialTotalTRY;
  const landedTotalTRY = estimate.totalCostTRY;
  const totalUSD = usdTry > 0 ? landedTotalTRY / usdTry : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="relative h-full"
    >
      {listing.isUserCreated && onDelete ? (
        <button
          type="button"
          onClick={() => onDelete(listing.id)}
          className="absolute right-3 top-14 z-10 shrink-0 rounded-md border border-[var(--danger)]/25 bg-card/95 p-2 text-[var(--danger)] shadow-sm backdrop-blur transition hover:bg-[var(--danger)]/10"
          aria-label={`${listing.title} ilanını sil`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
      <Link
        to="/listing/$id"
        params={{ id: listing.id }}
        className={`group flex flex-col h-full rounded-lg bg-card overflow-hidden hover:shadow-[var(--shadow-card)] hover:-translate-y-1 transition-all ${
          isBuy ? "border-2 border-[var(--cave)]/40" : "border border-border/60"
        }`}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary shrink-0">
          <img
            src={IMAGE_MAP[listing.image] ?? IMAGE_MAP.tuff}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-[11px] font-semibold uppercase tracking-wider text-foreground">
              {CATEGORY_LABELS[listing.category]}
            </span>
            {isBuy ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--cave)]/90 backdrop-blur text-[11px] font-semibold uppercase tracking-wider text-background">
                <ShoppingCart className="w-3 h-3" /> Alım Talebi
              </span>
            ) : listing.isUserCreated ? (
              <span className="px-2.5 py-1 rounded-full bg-primary/90 backdrop-blur text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                Yeni
              </span>
            ) : null}
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {listing.city}
            </span>
            <span>·</span>
            <span>{listing.seller}</span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-border/60">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Miktar
              </div>
              <div className="font-mono text-sm font-semibold">
                {listing.tonnage} <span className="text-muted-foreground font-normal">ton</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Truck className="w-3 h-3" />
                Mesafe
                {calculating ? (
                  <LoaderCircle className="h-3 w-3 animate-spin text-primary" />
                ) : null}
              </div>
              <div className="font-mono text-sm font-semibold">
                {calculating ? (
                  <LoadingText />
                ) : (
                  <>
                    {km.toFixed(0)} <span className="text-muted-foreground font-normal">km</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--moss-deep)] flex items-center gap-1">
                <Leaf className="w-3 h-3" />
                CO₂
                {calculating ? <LoaderCircle className="h-3 w-3 animate-spin" /> : null}
              </div>
              <div className="font-mono text-sm font-semibold text-[var(--moss-deep)]">
                {calculating ? (
                  <LoadingText />
                ) : (
                  <>
                    {co2.toFixed(0)} <span className="font-normal opacity-70">kg</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-border/60 flex items-end justify-between">
            <div>
              {isBuy ? (
                <>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Hedef Fiyat
                  </div>
                  <div className="font-display text-xl font-semibold text-foreground">
                    {listing.pricePerTonTRY > 0 ? fmtTRY(materialTotalTRY) : "Görüşülür"}
                  </div>
                  {listing.pricePerTonTRY > 0 && (
                    <div className="text-xs text-muted-foreground font-mono">
                      {fmtTRY(listing.pricePerTonTRY)}/ton
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Konuma Göre Toplam
                    {calculating ? (
                      <LoaderCircle className="ml-1 inline h-3 w-3 animate-spin text-primary" />
                    ) : null}
                  </div>
                  <div className="font-display text-xl font-semibold text-foreground">
                    {calculating ? <LoadingText /> : fmtTRY(landedTotalTRY)}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {calculating
                      ? "Hesaplanıyor"
                      : `${totalUSD ? `≈ ${fmtUSD(totalUSD)}` : "TCMB bekleniyor"} · taşıma dahil`}
                  </div>
                </>
              )}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground text-right">
              {VEHICLE_LABELS[listing.vehicle]}
              <br />
              <span className="text-foreground font-mono normal-case tracking-normal">
                {listing.pricePerTonTRY > 0 ? `${fmtTRY(listing.pricePerTonTRY)}/ton` : "—"}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function LoadingText() {
  return <span className="text-muted-foreground">Yükleniyor...</span>;
}
