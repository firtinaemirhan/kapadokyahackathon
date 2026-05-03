import { MarketplaceBoard } from "@/components/listing/MarketplaceBoard";
import { listings } from "@/lib/demo-data";

export default function ListingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">B2B marketplace</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">Kapadokya yan ürün pazarı</h1>
        <p className="mt-2 max-w-3xl text-stone-600">
          Çok satıcılı pazarda üretici ilanları, alıcının konumuna göre mesafe, karbon, fiyat ve canlı TCMB kur etkisiyle
          karşılaştırılır.
        </p>
      </div>
      <MarketplaceBoard listings={listings} />
    </div>
  );
}
