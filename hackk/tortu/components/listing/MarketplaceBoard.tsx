"use client";

import * as React from "react";
import { ArrowDownUp, BadgeAlert, Building2, CircleDollarSign, PackageSearch, Users } from "lucide-react";
import { IndustrialPoiPanel } from "@/components/geo/IndustrialPoiPanel";
import { ListingCard } from "@/components/listing/ListingCard";
import { ListingFilters } from "@/components/listing/ListingFilters";
import { ListingMap } from "@/components/map/ListingMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DEFAULT_BUYER_LOCATION } from "@/lib/constants";
import { getSeller, toTon } from "@/lib/demo-data";
import { haversineKm } from "@/lib/geo";
import type { CurrencyRates, Listing } from "@/lib/types";

type SortKey = "carbon" | "distance" | "price";

export function MarketplaceBoard({ listings }: { listings: Listing[] }) {
  const [rates, setRates] = React.useState<CurrencyRates | null>(null);
  const [sortKey, setSortKey] = React.useState<SortKey>("carbon");

  React.useEffect(() => {
    fetch("/api/exchange-rates")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setRates(data);
      })
      .catch(() => setRates(null));
  }, []);

  const sellers = new Set(listings.map((listing) => listing.seller_id)).size;
  const exportable = listings.filter((listing) => listing.is_export_eligible).length;
  const tons = listings.reduce((sum, listing) => sum + toTon(listing.quantity_value, listing.quantity_unit), 0);

  const sorted = [...listings].sort((a, b) => {
    if (sortKey === "price") return a.price_try - b.price_try;
    const distanceA = haversineKm(DEFAULT_BUYER_LOCATION, [a.pickup_latitude, a.pickup_longitude]);
    const distanceB = haversineKm(DEFAULT_BUYER_LOCATION, [b.pickup_latitude, b.pickup_longitude]);
    if (sortKey === "distance") return distanceA - distanceB;
    return distanceA * toTon(a.quantity_value, a.quantity_unit) - distanceB * toTon(b.quantity_value, b.quantity_unit);
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={Users} label="Aktif satıcı" value={String(sellers)} />
        <Metric icon={PackageSearch} label="Açık ilan" value={String(listings.length)} />
        <Metric icon={Building2} label="İhracata uygun" value={String(exportable)} />
        <Metric icon={CircleDollarSign} label="Marketplace hacmi" value={`${tons.toFixed(1)} ton`} />
      </section>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge variant={rates?.stale ? "destructive" : "secondary"}>
              {rates ? `USD/TRY ${rates.USD_TRY.toFixed(2)} · ${rates.source}` : "TCMB kuru yükleniyor"}
            </Badge>
            <h2 className="mt-3 font-serif text-2xl font-semibold">Çok satıcılı Tortu pazarı</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
              Avanos, Ürgüp, Niğde, Hacıbektaş ve Acıgöl üreticileri tek pazarda listelenir. Alıcı, her ilanı kendi
              Kayseri konumuna göre mesafe, karbon ve canlı döviz etkisiyle karşılaştırır.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={sortKey === "carbon" ? "default" : "outline"} onClick={() => setSortKey("carbon")}>
              <ArrowDownUp className="h-4 w-4" />
              Karbona göre
            </Button>
            <Button variant={sortKey === "distance" ? "default" : "outline"} onClick={() => setSortKey("distance")}>
              Mesafeye göre
            </Button>
            <Button variant={sortKey === "price" ? "default" : "outline"} onClick={() => setSortKey("price")}>
              Fiyata göre
            </Button>
          </div>
        </div>
        {rates?.stale && (
          <div className="mt-4 flex gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
            <BadgeAlert className="h-4 w-4 shrink-0" />
            TCMB bağlantısı kesildi; son cache kayıtlarıyla stale karar veriliyor.
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <ListingFilters />
        <div className="space-y-6">
          <ListingMap listings={sorted} />
          <IndustrialPoiPanel />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                seller={getSeller(listing.seller_id)}
                usdTry={rates?.USD_TRY}
                fxSource={rates?.source}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card className="p-4">
      <Icon className="h-5 w-5 text-emerald-800" />
      <div className="mt-4 text-2xl font-semibold">{value}</div>
      <p className="mt-1 text-sm text-stone-600">{label}</p>
    </Card>
  );
}
