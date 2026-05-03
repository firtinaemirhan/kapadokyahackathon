import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-[var(--cave)] text-background mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="font-display text-3xl font-semibold">Tortu</div>
          <p className="mt-3 max-w-md text-sm text-background/70 leading-relaxed">
            Kapadokya'da üretim sırasında ortaya çıkan atık ve yan ürünleri yeniden
            değerlendirilebilir kaynaklara dönüştürmeyi amaçlayan dijital platform. İşletmeleri bir
            araya getirir; malzeme, konum, değer ve çevresel etki bilgilerini görünür kılar.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em] text-background/60">
            <span className="px-2.5 py-1 rounded-full border border-background/20">
              Kapadokya Odaklı
            </span>
            <span className="px-2.5 py-1 rounded-full border border-background/20">
              Döngüsel Ekonomi
            </span>
            <span className="px-2.5 py-1 rounded-full border border-background/20">
              Konum Bazlı Eşleşme
            </span>
            <span className="px-2.5 py-1 rounded-full border border-background/20">
              Etki Takibi
            </span>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-background/50 mb-3">
            Platform
          </div>
          <ul className="space-y-2 text-sm text-background/80">
            <li>
              <Link to="/marketplace" className="hover:text-background">
                Pazaryeri
              </Link>
            </li>
            <li>
              <Link to="/sell" className="hover:text-background">
                İlan Ver
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-background">
                Nasıl Çalışır?
              </Link>
            </li>
            <li>
              <Link to="/api-status" className="hover:text-background">
                Canlı API Testi
              </Link>
            </li>
            <li>
              <Link to="/methodology" className="hover:text-background">
                Hesaplama Yöntemi
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-background/50 mb-3">Bölge</div>
          <ul className="space-y-2 text-sm text-background/80">
            <li>Avanos • Ürgüp</li>
            <li>Nevşehir • Niğde</li>
            <li>Kayseri OSB</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 text-xs text-background/50 flex flex-col sm:flex-row justify-between gap-2">
          <span>© 2026 Tortu — Kapadokya Hackathon Cave2Cloud projesi.</span>
          <span>
            <Link to="/api-status" className="hover:text-background">
              Canlı veri bağlantı testi
            </Link>{" "}
            · <span className="font-mono">v0.1</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
