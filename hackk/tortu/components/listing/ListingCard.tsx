import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeAlert, Building2, MapPin, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calculateCO2, marginTone } from "@/lib/carbon";
import { DEFAULT_BUYER_LOCATION } from "@/lib/constants";
import { formatTry, formatUsd } from "@/lib/currency";
import { getCategory, toTon } from "@/lib/demo-data";
import { formatKm, haversineKm } from "@/lib/geo";
import type { Listing, Profile } from "@/lib/types";

export function ListingCard({
  listing,
  seller,
  usdTry,
  fxSource
}: {
  listing: Listing;
  seller?: Profile;
  usdTry?: number;
  fxSource?: string;
}) {
  const category = getCategory(listing.category_slug);
  const km = haversineKm(DEFAULT_BUYER_LOCATION, [listing.pickup_latitude, listing.pickup_longitude]) * 1.3;
  const co2 = calculateCO2(km, toTon(listing.quantity_value, listing.quantity_unit), listing.preferred_transport_mode);
  const tone = usdTry ? marginTone(listing.price_try, usdTry, listing.is_export_eligible) : "neutral";
  const exportBadge =
    tone === "green" ? "Marj güçlü" : tone === "yellow" ? "Marj izlenmeli" : tone === "red" ? "Kur riski" : "Kur bekleniyor";

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/9]">
        <Image src={listing.photo_urls[0]} alt={listing.title} fill className="object-cover" sizes="(max-width:768px) 100vw,33vw" />
      </div>
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge>{category.name_tr}</Badge>
          {listing.is_export_eligible && (
            <Badge variant={tone === "green" ? "default" : tone === "yellow" ? "secondary" : tone === "red" ? "destructive" : "outline"}>
              {exportBadge}
            </Badge>
          )}
        </div>

        <div>
          <h3 className="line-clamp-2 font-semibold">{listing.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-stone-600">
            <Building2 className="h-3 w-3" />
            {seller?.company_name ?? "Tortu satıcısı"} · {listing.pickup_city}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <span className="rounded bg-stone-100 p-2">
            <b>{formatTry(listing.price_try)}</b>
            <br />
            <small>{usdTry ? formatUsd(listing.price_try / usdTry) : "TCMB bekleniyor"}</small>
          </span>
          <span className="rounded bg-stone-100 p-2">
            <MapPin className="inline h-3 w-3" /> {formatKm(km)}
          </span>
          <span className="rounded bg-stone-100 p-2">
            <Truck className="inline h-3 w-3" /> {co2.toFixed(1)} kg
          </span>
        </div>

        <div className="rounded-md border border-stone-200 p-3 text-xs leading-5 text-stone-600">
          <div className="flex items-center gap-1 font-medium text-stone-900">
            <BadgeAlert className="h-3 w-3 text-amber-600" />
            İş kararı sinyali
          </div>
          {usdTry
            ? `İhracat rozeti ${fxSource ?? "TCMB"} kuruna göre güncellenir; kur düştüğünde marj rengi değişir.`
            : "Kur yüklenene kadar USD karşılığı ve marj rozeti kilitlenir."}
        </div>

        <Button asChild className="w-full">
          <Link href={`/listings/${listing.id}`}>
            Detay ve Karbon Hesabı <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
