import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, Leaf, MapPin, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Tortu Hakkında — Cave2Cloud" },
      {
        name: "description",
        content:
          "Tortu nasıl çalışır: TCMB canlı kuru, OpenRouteService rotası ve UN/IPCC emisyon faktörleriyle döngüsel ekonomi.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Hakkında</div>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl font-semibold leading-[1.05]">
        Tortu, üretimden arta kalanı yeniden kaynağa dönüştürür.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
        Kapadokya'da üretim sırasında ortaya çıkan atık ve yan ürünleri görünür kılıyor; bu
        malzemeleri yeniden değerlendirmek isteyen işletmeleri aynı dijital platformda
        buluşturuyoruz. Tortu, malzeme, konum, tahmini değer ve çevresel etki bilgilerini birlikte
        göstererek daha bilinçli bir döngüsel ticaret süreci oluşturur.
      </p>

      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {[
          {
            icon: Coins,
            title: "Değer Hesabı",
            body: "Malzemelerin tahmini ekonomik karşılığı güncel kur bilgisiyle hesaplanır. Böylece işletmeler, ellerindeki kaynakların değerini daha net görebilir.",
            color: "var(--ember)",
          },
          {
            icon: MapPin,
            title: "Konum Bazlı Eşleşme",
            body: "İlanlar konum bilgisiyle birlikte görüntülenir. İşletmeler, kendilerine yakın kaynakları karşılaştırarak lojistik açıdan daha doğru karar verebilir.",
            color: "var(--cave)",
          },
          {
            icon: Leaf,
            title: "Etki Takibi",
            body: "Taşıma mesafesine göre tahmini çevresel etki hesaplanır. Daha yakın kaynakların tercih edilmesiyle hem maliyet hem karbon etkisi azaltılabilir.",
            color: "var(--moss)",
          },
        ].map((s) => (
          <div key={s.title} className="rounded-lg bg-card border border-border/60 p-6">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
              style={{ background: `color-mix(in oklab, ${s.color} 18%, transparent)` }}
            >
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <h3 className="font-display text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-lg bg-[image:var(--gradient-ember)] text-primary-foreground p-10">
        <h3 className="font-display text-3xl font-semibold leading-tight">
          Tortu, kalan malzemeleri yeni iş birliklerine dönüştüren bir kaynak ağıdır.
        </h3>
        <Link
          to="/marketplace"
          className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-background text-foreground font-semibold hover:bg-background/90"
        >
          Pazaryerini Gör <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
