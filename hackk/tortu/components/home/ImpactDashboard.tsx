"use client";

import * as React from "react";
import { ArrowUpRight, Banknote, CloudSun, PackageCheck, RefreshCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatTry } from "@/lib/currency";

const items = [
  { key: "totalQuantityTon", label: "Ton atık ekonomiye kazandırıldı", icon: PackageCheck },
  { key: "totalCo2SavedKg", label: "kg CO₂ azaltımına katkı", icon: CloudSun },
  { key: "totalRevenueTry", label: "üreticiye geri dönen değer", icon: Banknote }
];

export function ImpactDashboard() {
  const [stats, setStats] = React.useState<Record<string, number> | null>(null);
  const [updatedAt, setUpdatedAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setUpdatedAt(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
      });
  }, []);

  return (
    <section className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">Canlı etki panosu</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold">Tortu şu ana kadar ne sağladı?</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
            Bu metrikler işlem ve ilan tablolarından beslenen etki özetidir; demo verisiyle Kapadokya pilot etkisini gösterir.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
          <RefreshCcw className="h-3 w-3" />
          {updatedAt ? `Son yenileme ${updatedAt}` : "Yükleniyor"}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map(({ key, label, icon: Icon }) => (
          <Card key={key} className="border-emerald-900/10 p-5">
            <div className="flex items-start justify-between">
              <Icon className="h-7 w-7 text-emerald-800" />
              <ArrowUpRight className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-6 text-3xl font-semibold text-stone-950">
              {stats ? (key === "totalRevenueTry" ? formatTry(stats[key]) : Number(stats[key]).toLocaleString("tr-TR", { maximumFractionDigits: 1 })) : "..."}
            </div>
            <p className="mt-1 text-sm text-stone-600">{label}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
