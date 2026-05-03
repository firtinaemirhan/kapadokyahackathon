import Link from "next/link";
import { Recycle } from "lucide-react";
import { AuthActions } from "@/components/auth/AuthActions";
import { FxBadge } from "@/components/layout/FxBadge";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth/session";

export function Navbar({ locale }: { locale: string }) {
  const user = getAuthSession();
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#F5F1E8]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-emerald-900">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-emerald-800 text-white">
            <Recycle className="h-5 w-5" />
          </span>
          <span>Tortu</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-stone-700 md:flex">
          <Link href="/listings">Marketplace</Link>
          <Link href="/dashboard">Panel</Link>
          <Link href="/dashboard/wallet">Cüzdan</Link>
          <Link href="/admin">Admin</Link>
        </nav>
        <div className="flex items-center gap-2">
          <FxBadge />
          <LanguageSwitcher locale={locale} />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/listings/new">İlan Aç</Link>
          </Button>
          <AuthActions user={user} />
        </div>
      </div>
    </header>
  );
}
