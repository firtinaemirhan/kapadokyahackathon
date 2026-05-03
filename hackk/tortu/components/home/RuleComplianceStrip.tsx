import { BadgeDollarSign, Factory, Route } from "lucide-react";

const rules = [
  {
    title: "Dinamik karbon izi",
    text: "Alıcı ve satıcı koordinatlarından rota mesafesi alınır, ton-km emisyon faktörüyle CO₂ hesaplanır.",
    icon: Route
  },
  {
    title: "TCMB canlı kur",
    text: "USD/TRY ve EUR/TRY son güncelleme saatiyle gösterilir; ihracat marjı ve karbon maliyeti kuru izler.",
    icon: BadgeDollarSign
  },
  {
    title: "Bağımsız coğrafi veri",
    text: "Karbon zincirinden ayrı Nominatim ve Overpass işlevleriyle konum/OSB keşfi yapılır.",
    icon: Factory
  }
];

export function RuleComplianceStrip() {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {rules.map(({ title, text, icon: Icon }) => (
        <div key={title} className="rounded-lg border border-emerald-900/10 bg-white p-4">
          <Icon className="h-6 w-6 text-emerald-800" />
          <h3 className="mt-3 font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
        </div>
      ))}
    </section>
  );
}
