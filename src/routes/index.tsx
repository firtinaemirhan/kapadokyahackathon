import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Leaf,
  Coins,
  Route as RouteIcon,
  MapPin,
  TrendingUp,
  Handshake,
  FileText,
} from "lucide-react";
import heroImg from "@/assets/hero-cappadocia.jpg";
import { useFxRate } from "@/hooks/useFxRate";
import { SAMPLE_LISTINGS, CATEGORY_LABELS } from "@/lib/sample-listings";
import { ListingCard } from "@/components/ListingCard";
import { ListingsMap } from "@/components/ListingsMap";
import { exportBadge, fmtTRY } from "@/lib/tortu-utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tortu — Kapadokya'dan Global Pazara Akıllı Atık Ekonomisi" },
      {
        name: "description",
        content:
          "Üzüm posasından volkanik tüfe, seramik kırığından tekstil artığına: Tortu ile her atık global bir fırsata dönüşür.",
      },
      { property: "og:title", content: "Tortu — Kapadokya Döngüsel Ekonomi" },
      {
        property: "og:description",
        content: "Canlı TCMB kuru, gerçek rota, karbon ayak izi — tek panelde.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const fx = useFxRate();
  const featured = SAMPLE_LISTINGS.slice(0, 3);
  // Hero haritası: sadece 5 farklı ilan noktası.
  const heroMapListings = [
    SAMPLE_LISTINGS[4],
    SAMPLE_LISTINGS[0],
    SAMPLE_LISTINGS[2],
    SAMPLE_LISTINGS[3],
    SAMPLE_LISTINGS[1],
  ];
  const totalTonnage = SAMPLE_LISTINGS.reduce((s, l) => s + l.tonnage, 0);
  const totalValue = SAMPLE_LISTINGS.reduce((s, l) => s + l.tonnage * l.pricePerTonTRY, 0);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden min-h-[700px] lg:min-h-[800px]">
        {/* Full background map — Nevşehir odaklı, sabit görünüm */}
        <div className="absolute inset-0 z-0">
          <ListingsMap
            listings={heroMapListings}
            className="w-full h-full"
            fixedView={{ center: [38.6, 34.5], zoom: 10.5 }}
            showBuyer={false}
          />
        </div>

        {/* Gradient fade overlay - smooth transition from left (solid) to right (transparent) */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent pointer-events-none z-10" />

        {/* Content overlay */}
        <div className="absolute inset-0 z-20 flex items-center p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[0.95] text-foreground">
                <span className="text-hero-leaf">Tortu</span>
                <span className="text-foreground">:</span>
                <br />
                <span className="text-foreground">
                  Kalanı <span className="text-hero-leaf">kaynağa</span> dönüştüren platform.
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Tortu, Kapadokya&apos;nın endüstriyel yan ürünlerini canlı TCMB kuru, gerçek
                lojistik rotası ve karbon ayak izi hesabıyla tek vitrinde toplayan döngüsel ekonomi
                platformudur.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  to="/marketplace"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  Pazaryerini Keşfet
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/sell"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border bg-background/80 backdrop-blur text-foreground font-semibold hover:bg-background"
                >
                  Atığını İlana Çevir
                </Link>
              </div>

              {/* Live stats strip */}
              <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 gap-px bg-border/60 rounded-lg overflow-hidden border border-border/60 max-w-2xl">
                {[
                  { v: SAMPLE_LISTINGS.length.toString(), l: "Aktif İlan" },
                  { v: `${totalTonnage} t`, l: "Toplam Stok" },
                  { v: fmtTRY(totalValue).replace("₺", "₺ "), l: "Pazar Değeri" },
                ].map((s) => (
                  <div key={s.l} className="bg-background/95 backdrop-blur p-4">
                    <div className="font-display text-2xl font-semibold text-foreground">{s.v}</div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mt-1">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category marquee — hero'nun hemen altında */}
      <div className="border-y border-border/60 bg-background overflow-hidden">
        <div className="flex gap-12 py-4 scroll-marquee whitespace-nowrap">
          {[
            "Nevşehir Tüfü",
            "Seramik Artığı",
            "Tekstil Döngüsü",
            "Üzüm Posası",
            "Volkanik Kayalar",
            "Endüstriyel Atık",
            "Nevşehir Tüfü",
            "Seramik Artığı",
            "Tekstil Döngüsü",
            "Üzüm Posası",
            "Volkanik Kayalar",
            "Endüstriyel Atık",
          ].map((c, i) => (
            <span
              key={i}
              className="font-display text-2xl text-muted-foreground/60 italic shrink-0"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* THREE PILLARS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-2xl mb-16">
          <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
            Üç hesap, tek karar
          </div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold leading-tight">
            Fiyat, rota, karbon. Hepsi bir yerde.
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Coins,
              tag: "Finans",
              title: "Canlı Kur",
              body: "TCMB API'den anlık döviz. Kur hareketine göre otomatik marj rozeti — ihracat mantıklı mı?",
              color: "var(--ember)",
            },
            {
              icon: RouteIcon,
              tag: "Lojistik",
              title: "Gerçek Mesafe",
              body: "Kuş uçuşu değil. OpenRouteService ile araç tipine göre navigasyon.",
              color: "var(--cave)",
            },
            {
              icon: Leaf,
              tag: "Çevre",
              title: "Karbon Metre",
              body: "ESG raporlamaya hazır. Her sevkiyatın kg CO₂ faturası.",
              color: "var(--moss)",
            },
          ].map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-lg bg-card p-6 border border-border/60 hover:shadow-[var(--shadow-card)] transition-shadow"
            >
              <div
                className="w-12 h-12 rounded-md flex items-center justify-center mb-5"
                style={{ background: `color-mix(in oklab, ${p.color} 18%, transparent)` }}
              >
                <p.icon className="w-6 h-6" style={{ color: p.color }} />
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                {p.tag}
              </div>
              <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">{p.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* REAL-WORLD CASES */}
      <section className="border-y border-border/60 bg-secondary/45">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="mb-10 max-w-2xl">
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
              Sahadan iki hikaye
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold leading-tight">
              Atık, doğru kişiyle buluştuğunda ticarete dönüşür.
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-lg border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                    Üretici ile alıcı eşleşmesi
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">
                    Adem abinin pancar posası, Ali abinin ihtiyacına dönüştü.
                  </h3>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Handshake className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Adem abi şeker pancarı üreten bir işletmeci. Asıl işi pancar satmak; fakat üretim
                sonunda elinde düzenli olarak posa kalıyor. Bu posanın bir değeri olabileceğini
                biliyor ama kime, nasıl ve hangi şartlarda ulaştıracağını bilmiyor.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Tortu&apos;ya geldiğinde posasını miktarı, konumu ve taşıma bilgisiyle görünür hale
                getiriyor. Aynı dönemde Ali abi de kendi üretim süreci için bu tip bir yan ürüne
                ihtiyaç duyuyor. Platform iki tarafı aynı ekranda buluşturuyor; fiyat, mesafe ve
                taşıma hesabı netleşince aralarında güvenli bir ticaret dönüyor.
              </p>
              <div className="mt-5 rounded-lg bg-primary/10 px-4 py-3 text-sm text-[var(--moss-deep)]">
                Adem abi elindeki posayı atık olmaktan çıkarıp gelire çeviriyor. Ali abi de aradığı
                hammaddeye daha hızlı ve daha uygun bir kanaldan ulaşıyor.
              </div>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="rounded-lg border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                    ESG odaklı tedarik
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">
                    Yakındaki tedarikçi, karbonu ve maliyeti birlikte düşürdü.
                  </h3>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Bir hammadde alıcısı, ESG sürdürülebilirlik raporu kapsamında tedarik zincirindeki
                karbon ayak izini azaltmak istiyor. İhtiyacını ilan olarak açıyor ve özellikle yakın
                bölgedeki üreticilerden teklif almayı hedefliyor.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Yakın bir OSB&apos;deki üretici bu ilana teklif veriyor. Tortu, iki taraf için
                mesafeyi, tahmini taşıma maliyetini ve karbon etkisini aynı hesapta gösteriyor.
                Böylece alıcı sadece fiyatı değil, tedarik kararının çevresel etkisini de şeffaf
                biçimde karşılaştırabiliyor.
              </p>
              <div className="mt-5 rounded-lg bg-primary/10 px-4 py-3 text-sm text-[var(--moss-deep)]">
                Alıcı raporlanabilir ve daha düşük karbonlu bir tedarik akışı kuruyor. Üretici de
                doğru talebe görünür olup ticareti güvenilir bir zeminde tamamlıyor.
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
              Bugünün vitrini
            </div>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold">
              Öne çıkan ilanlar
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"
          >
            Tüm pazaryeri <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((l, i) => {
            const badge = exportBadge(fx.usdTry, fx.dailyChangePct + (i - 1) * 0.3);
            return (
              <ListingCard
                key={l.id}
                listing={l}
                usdTry={fx.usdTry}
                exportLevel={badge.level}
                index={i}
              />
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative rounded-lg overflow-hidden bg-[image:var(--gradient-cave)] text-background p-10 sm:p-16">
          <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-[var(--ember)] opacity-20 blur-3xl" />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-background/70">
              <TrendingUp className="w-4 h-4" /> Sürdürülebilir kazanç
            </div>
            <h3 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-tight">
              Tek bir kamyon, üç ayrı kazanım: gelir, marj, karbon.
            </h3>
            <p className="mt-5 text-background/75 text-lg max-w-lg">
              Üreticiyseniz atığınızı listelemek 60 saniye sürer. Alıcıysanız fiyat, mesafe ve
              karbon filtreleriyle ESG dostu satın alımı dakikalar içinde tamamlarsınız.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/sell"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90"
              >
                İlan Vermeye Başla <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-background/20 text-background hover:bg-background/10"
              >
                <MapPin className="w-4 h-4" /> Haritada Gör
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
