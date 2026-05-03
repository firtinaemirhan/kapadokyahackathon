import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe2, MapPinned, Store, Truck } from "lucide-react";
import { RuleComplianceStrip } from "@/components/home/RuleComplianceStrip";
import { ImpactDashboard } from "@/components/home/ImpactDashboard";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categories, listings } from "@/lib/demo-data";

export default function HomePage() {
  return (
    <div>
      <section className="relative min-h-[76vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?auto=format&fit=crop&w=1800&q=80"
          alt="Kapadokya"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
        <div className="relative mx-auto flex min-h-[76vh] max-w-7xl flex-col justify-center px-4 py-20 text-white">
          <Badge className="mb-5 w-fit bg-amber-500 text-stone-950">Cave2Cloud 2026 · B2B Marketplace</Badge>
          <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-tight md:text-7xl">Tortu</h1>
          <p className="mt-4 max-w-3xl text-2xl font-semibold text-stone-100">Kapadokya'dan başlayan döngü.</p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-100">
            Seramik fireleri, üzüm cibresi, bakliyat kabuğu ve perlit/pomza gibi bölgesel yan ürünler tek pazarda
            listelenir; alıcılar canlı kur, rota ve karbon maliyetiyle karar verir.
          </p>
          <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-white/15 p-3 backdrop-blur">
              <b className="block text-2xl">49</b>
              <span className="text-xs text-stone-100">tamamlanan işlem</span>
            </div>
            <div className="rounded-lg bg-white/15 p-3 backdrop-blur">
              <b className="block text-2xl">12.4 ton</b>
              <span className="text-xs text-stone-100">CO₂ azaltım etkisi</span>
            </div>
            <div className="rounded-lg bg-white/15 p-3 backdrop-blur">
              <b className="block text-2xl">5 satıcı</b>
              <span className="text-xs text-stone-100">Kapadokya pilotu</span>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/listings">
                Marketplace'e Gir <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/listings/new">Satıcı Olarak İlan Aç</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <ImpactDashboard />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <RuleComplianceStrip />
      </section>

      <section className="border-y border-stone-200 bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">Çok taraflı pazar</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold">Satıcı akışı ve alıcı akışı aynı ekranda buluşur</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-stone-100 p-5">
                <Store className="h-7 w-7 text-emerald-800" />
                <h3 className="mt-4 font-semibold">Üretici / satıcı</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Fotoğraf ve açıklamayla AI kategori önerisi alır, miktar/fiyat/GTİP ve ihracat bayrağıyla ilan açar.
                </p>
              </div>
              <div className="rounded-lg bg-stone-100 p-5">
                <Truck className="h-7 w-7 text-emerald-800" />
                <h3 className="mt-4 font-semibold">Alıcı / geri dönüştürücü</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Mesafe, CO₂, TRY/USD/EUR maliyet ve kur etkili marj rozetiyle satın alma veya iletişim kararı verir.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-[#2D5F3F] p-6 text-white">
            <Globe2 className="h-9 w-9 text-amber-300" />
            <h3 className="mt-5 text-xl font-semibold">Mağaranın derinliğindeki değeri buluta taşıyoruz.</h3>
            <p className="mt-3 text-sm leading-6 text-emerald-50">
              Cave2Cloud burada yalnızca slogan değil: Kapadokya'nın görünmeyen yan ürün akışları bulutta aranabilir,
              fiyatlanabilir, rotalanabilir ve ihracata hazır veri çıktısına dönüşür.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {listings.map((listing) => (
                <div key={listing.id} className="rounded-md bg-white/10 p-3 text-sm">
                  <MapPinned className="mb-2 h-4 w-4 text-amber-300" />
                  {listing.pickup_city}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 font-serif text-3xl font-semibold">Marketplace nasıl çalışır</h2>
        <HowItWorks />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="mb-6 font-serif text-3xl font-semibold">Kapadokya ürün ve yan ürün akışları</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {categories.map((category) => (
            <div key={category.slug} className="rounded-lg border border-stone-200 bg-white p-4">
              <b>{category.name_tr}</b>
              <p className="mt-1 text-sm text-stone-600">{category.description_tr}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
