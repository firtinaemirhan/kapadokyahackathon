import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, FileText, Mail, ShoppingCart } from "lucide-react";
import { CarbonPanel } from "@/components/listing/CarbonPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DEFAULT_BUYER_LOCATION } from "@/lib/constants";
import { formatTry } from "@/lib/currency";
import { getCategory, getSeller, listings, toTon } from "@/lib/demo-data";

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = listings.find((item) => item.id === params.id);
  if (!listing) notFound();
  const seller = getSeller(listing.seller_id);
  const category = getCategory(listing.category_slug);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_420px]">
      <div className="space-y-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
          <Image src={listing.photo_urls[0]} alt={listing.title} fill className="object-cover" priority />
        </div>

        <Card className="p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge>{category.name_tr}</Badge>
            {listing.is_export_eligible && <Badge variant="secondary">İhracata uygun · GTİP {listing.gtip_code ?? "bekliyor"}</Badge>}
            <Badge variant="outline">Satıcı: {seller.company_name}</Badge>
          </div>
          <h1 className="font-serif text-4xl font-semibold">{listing.title}</h1>
          <p className="mt-4 leading-8 text-stone-700">{listing.description}</p>
          <dl className="mt-6 grid gap-3 sm:grid-cols-4">
            <div>
              <dt className="text-sm text-stone-500">Miktar</dt>
              <dd className="font-semibold">
                {listing.quantity_value} {listing.quantity_unit}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-stone-500">Fiyat</dt>
              <dd className="font-semibold">{formatTry(listing.price_try)} / ton</dd>
            </div>
            <div>
              <dt className="text-sm text-stone-500">Taşıma modu</dt>
              <dd className="font-semibold">{listing.preferred_transport_mode}</dd>
            </div>
            <div>
              <dt className="text-sm text-stone-500">Alım noktası</dt>
              <dd className="font-semibold">{listing.pickup_city}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="font-serif text-2xl font-semibold">Marketplace işlem akışı</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              "Alıcı karbon ve kur snapshot'ını hesaplar",
              "Satın alma talebi satıcı onayına düşer",
              "Onay sonrası cüzdan ve PDF sertifika oluşur"
            ].map((step) => (
              <div key={step} className="rounded-lg bg-stone-100 p-4 text-sm leading-6">
                <CheckCircle2 className="mb-3 h-5 w-5 text-emerald-800" />
                {step}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <aside className="space-y-5">
        <Card className="p-5">
          <h2 className="font-semibold">Satıcı mağazası</h2>
          <p className="mt-2 text-lg">{seller.company_name}</p>
          <p className="text-sm text-stone-600">{seller.address}</p>
          <div className="mt-4 grid gap-2">
            <Button>
              <ShoppingCart className="h-4 w-4" /> Satın Alma Talebi Oluştur
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4" /> KVKK ile İletişim Talebi
            </Button>
            <Button asChild variant="outline">
              <a href="/api/certificates/tx-001">
                <FileText className="h-4 w-4" /> Örnek Sertifika PDF
              </a>
            </Button>
          </div>
        </Card>

        <CarbonPanel
          buyerLatLng={DEFAULT_BUYER_LOCATION}
          sellerLatLng={[listing.pickup_latitude, listing.pickup_longitude]}
          weightTon={toTon(listing.quantity_value, listing.quantity_unit)}
          defaultMode={listing.preferred_transport_mode}
        />
      </aside>
    </div>
  );
}
