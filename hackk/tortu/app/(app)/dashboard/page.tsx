import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { transactions } from "@/lib/demo-data";
import { getAuthSession } from "@/lib/auth/session";

export default function DashboardPage() {
  const session = getAuthSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">{session.companyName}</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Operasyon paneli</h1>
          <p className="mt-2 text-stone-600">Satıcı onayı, aktif ilanlar ve karbon cüzdanı özeti.</p>
        </div>
        <Button asChild>
          <Link href="/listings/new">
            <Plus className="h-4 w-4" /> Yeni ilan
          </Link>
        </Button>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <Clock className="h-6 w-6 text-amber-600" />
          <b className="mt-4 block text-2xl">3</b>
          <span className="text-sm text-stone-600">Bekleyen sipariş</span>
        </Card>
        <Card className="p-5">
          <Check className="h-6 w-6 text-emerald-700" />
          <b className="mt-4 block text-2xl">{transactions.length}</b>
          <span className="text-sm text-stone-600">Tamamlanan işlem</span>
        </Card>
        <Card className="p-5">
          <b className="text-2xl">78.7 kg</b>
          <p className="mt-4 text-sm text-stone-600">Bu hafta hesaplanan CO₂ tasarrufu</p>
        </Card>
      </div>
    </div>
  );
}
