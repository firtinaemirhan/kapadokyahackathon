import { Link, useRouterState } from "@tanstack/react-router";
import { useFxRate } from "@/hooks/useFxRate";
import { useAuthUser } from "@/hooks/useAuthUser";
import { ArrowUpRight, ArrowDownRight, Minus, UserCircle } from "lucide-react";
import tortuLogo from "@/assets/tortu-transparent.png";

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const fx = useFxRate();
  const { user, logout } = useAuthUser();
  const trend = fx.dailyChangePct > 0.1 ? "up" : fx.dailyChangePct < -0.1 ? "down" : "flat";

  const navLink = (href: string, label: string) => {
    const active = path === href || (href !== "/" && path.startsWith(href));
    return (
      <Link
        to={href}
        className={`text-sm tracking-tight transition-colors ${
          active ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-[1000] backdrop-blur-xl bg-background/75 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center group" aria-label="Tortu ana sayfa">
          <img
            src={tortuLogo}
            alt="Tortu"
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {navLink("/", "Ana Sayfa")}
          {navLink("/marketplace", "Pazaryeri")}
          {navLink("/sell", "İlan Ver")}
          {navLink("/about", "Hakkında")}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border/60 font-mono text-xs">
            <span className="text-muted-foreground">USD/TRY</span>
            <span className="font-semibold text-foreground">
              {fx.loading ? "…" : fx.usdTry.toFixed(2)}
            </span>
            <span
              className={`flex items-center gap-0.5 ${
                trend === "up"
                  ? "text-[var(--moss)]"
                  : trend === "down"
                    ? "text-[var(--danger)]"
                    : "text-muted-foreground"
              }`}
            >
              {trend === "up" ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : trend === "down" ? (
                <ArrowDownRight className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {fx.dailyChangePct.toFixed(2)}%
            </span>
          </div>
          <Link
            to={user ? "/profile" : "/auth"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <UserCircle className="h-4 w-4" />
            Profil
          </Link>
          {user ? (
            <button
              type="button"
              onClick={logout}
              className="hidden sm:inline-flex items-center px-3 py-2 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Çıkış
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
