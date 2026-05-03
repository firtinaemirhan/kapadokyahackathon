import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment, type ReactNode } from "react";
import { ArrowLeft, Calculator, Leaf, MapPin, ReceiptText, Truck } from "lucide-react";
import {
  DEFAULT_CARBON_PRICE_TRY_PER_TON,
  EMISSION_FACTORS,
  TRANSPORT_RATE_TRY_PER_TON_KM,
  fmtCurrency,
  fmtTRY,
} from "@/lib/tortu-utils";
import { VEHICLE_LABELS, type VehicleType } from "@/lib/sample-listings";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Hesaplama Yöntemi — Tortu" },
      {
        name: "description",
        content:
          "Tortu fiyat, rota, taşıma maliyeti, karbon salımı ve karbon maliyeti hesaplama mantığını örneklerle açıklar.",
      },
    ],
  }),
  component: MethodologyPage,
});

const vehicleOrder: VehicleType[] = ["truck", "van", "rail", "sea"];

function MethodologyPage() {
  const sampleQuantityTon = 10;
  const sampleDistanceKm = 120;
  const sampleUnitPriceTRY = 2000;
  const sampleVehicle: VehicleType = "truck";
  const sampleTransportRate = TRANSPORT_RATE_TRY_PER_TON_KM[sampleVehicle];
  const sampleMaterialTotal = sampleQuantityTon * sampleUnitPriceTRY;
  const sampleTransportCost = sampleQuantityTon * sampleDistanceKm * sampleTransportRate;
  const sampleTotal = sampleMaterialTotal + sampleTransportCost;
  const sampleCo2Kg = sampleQuantityTon * sampleDistanceKm * EMISSION_FACTORS[sampleVehicle];
  const sampleCarbonCostTRY = (sampleCo2Kg / 1000) * DEFAULT_CARBON_PRICE_TRY_PER_TON;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Pazaryerine dön
      </Link>

      <div className="mt-8">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Hesaplama yöntemi
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
          Fiyat, rota ve karbon hesabı aynı konum senaryosundan türetilir.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          Tortu'da ilandaki baz ürün fiyatı tek başına toplam maliyet değildir. Alıcının GPS ya da
          arama ile seçtiği konum, miktar ve taşıma aracı hesaba girer; sonuç fiyat ve karbon
          tarafında birlikte güncellenir.
        </p>
      </div>

      <section className="mt-12 grid gap-5 md:grid-cols-2">
        <MethodBlock
          icon={<MapPin className="h-5 w-5" />}
          title="1. Konum ve mesafe"
          body="Satıcı konumu ile alıcının seçtiği konum arasında önce canlı rota servisi denenir. Rota alınamazsa kuş uçumu mesafe yol kıvrım katsayısıyla büyütülerek tahmini kara yolu mesafesine çevrilir."
        />
        <MethodBlock
          icon={<ReceiptText className="h-5 w-5" />}
          title="2. Ürün ve taşıma fiyatı"
          body="Ürün bedeli miktar ile birim fiyatın çarpımıdır. Taşıma bedeli ise ton, kilometre ve seçilen aracın ton-km birim bedeliyle hesaplanır."
        />
        <MethodBlock
          icon={<Leaf className="h-5 w-5" />}
          title="3. Karbon salımı"
          body="Karbon salımı ton × km × emisyon katsayısı formülüyle bulunur. Katsayı taşıma tipine göre değişir; TIR ve kamyonet yüksek, demiryolu ve deniz yolu daha düşük kabul edilir."
        />
        <MethodBlock
          icon={<Calculator className="h-5 w-5" />}
          title="4. Karbon maliyeti"
          body={`CO₂ kg değeri tona çevrilir ve varsayılan ${fmtTRY(
            DEFAULT_CARBON_PRICE_TRY_PER_TON,
          )}/ton karbon fiyatıyla çarpılır. TL maliyet, canlı kur varsa hedef dövize de çevrilir.`}
        />
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl font-semibold">Örnek hesap</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          10 ton ürün, 120 km TIR taşıması ve 2.000 TL/ton teklif için sistemin izlediği hesap:
        </p>
        <div className="mt-5 overflow-hidden rounded-lg border border-border/60 bg-card">
          <div className="grid gap-px bg-border/60 text-sm md:grid-cols-2">
            <ExampleRow label="Ürün bedeli" value={`10 ton × ${fmtTRY(sampleUnitPriceTRY)}`} />
            <ExampleRow label="Sonuç" value={fmtTRY(sampleMaterialTotal)} />
            <ExampleRow
              label="Taşıma bedeli"
              value={`10 ton × 120 km × ${fmtCurrency(sampleTransportRate, "TRY", 2)}/ton-km`}
            />
            <ExampleRow label="Sonuç" value={fmtTRY(sampleTransportCost)} />
            <ExampleRow label="Toplam maliyet" value="Ürün bedeli + taşıma bedeli" />
            <ExampleRow label="Sonuç" value={fmtTRY(sampleTotal)} />
            <ExampleRow label="Karbon salımı" value="10 ton × 120 km × 0,10 kg CO₂/ton-km" />
            <ExampleRow label="Sonuç" value={`${sampleCo2Kg.toFixed(0)} kg CO₂`} />
            <ExampleRow
              label="Karbon maliyeti"
              value={`${sampleCo2Kg.toFixed(0)} kg / 1000 × 350 TL`}
            />
            <ExampleRow label="Sonuç" value={fmtTRY(sampleCarbonCostTRY)} />
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl font-semibold">Emisyon ve taşıma katsayıları</h2>
        <div className="mt-5 overflow-hidden rounded-lg border border-border/60 bg-card">
          <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-px bg-border/60 text-sm">
            <TableCell strong>Araç</TableCell>
            <TableCell strong>Emisyon katsayısı</TableCell>
            <TableCell strong>Taşıma birim fiyatı</TableCell>
            {vehicleOrder.map((vehicle) => (
              <Fragment key={vehicle}>
                <TableCell key={`${vehicle}-label`}>
                  <span className="inline-flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    {VEHICLE_LABELS[vehicle]}
                  </span>
                </TableCell>
                <TableCell key={`${vehicle}-co2`}>
                  {EMISSION_FACTORS[vehicle]} kg CO₂/ton-km
                </TableCell>
                <TableCell key={`${vehicle}-rate`}>
                  {fmtCurrency(TRANSPORT_RATE_TRY_PER_TON_KM[vehicle], "TRY", 2)}/ton-km
                </TableCell>
              </Fragment>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Katsayılar uygulama içi karar destek amacıyla sadeleştirilmiş ortalama değerlerdir.
          Operasyonel teklif öncesinde satıcı, alıcı ve lojistik sağlayıcı bilgileriyle
          kesinleştirilmelidir.
        </p>
      </section>
    </div>
  );
}

function MethodBlock({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function ExampleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-sm font-semibold">{value}</div>
    </div>
  );
}

function TableCell({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return (
    <div className={`bg-card px-4 py-3 ${strong ? "font-semibold" : "text-muted-foreground"}`}>
      {children}
    </div>
  );
}
