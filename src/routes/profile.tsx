import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { saveUser, type UserRole } from "@/lib/auth";
import { useAuthUser } from "@/hooks/useAuthUser";
import { TURKEY_CITIES } from "@/lib/turkey-data";
import {
  updateUser,
  getListings,
  getMyContactRequests,
  type ContactRequest,
} from "@/lib/api-client";
import { SAMPLE_LISTINGS, CATEGORY_LABELS, VEHICLE_LABELS } from "@/lib/sample-listings";
import type { Listing } from "@/lib/sample-listings";
import { fmtTRY } from "@/lib/tortu-utils";
import {
  User,
  Building2,
  MapPin,
  Leaf,
  PackageCheck,
  ArrowRight,
  Clock,
  Truck,
  LogOut,
  Pencil,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profil — Tortu" },
      { name: "description", content: "Tortu kullanıcı profili ve firma bilgileri." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthUser();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("producer");
  const [city, setCity] = useState("Nevşehir");
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myRequests, setMyRequests] = useState<ContactRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"listings" | "requests">("listings");

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setCompanyName(user.companyName);
    setPhone(user.phone ?? "");
    setRole(user.role);
    setCity(user.city);

    // Load user's listings
    getListings()
      .then((result) => {
        const all = [...(result.listings ?? []), ...SAMPLE_LISTINGS];
        setMyListings(all.filter((l) => l.isUserCreated && l.createdBy === user.id));
      })
      .catch(() => {});

    // Load user's contact requests (trade history)
    getMyContactRequests(user.email)
      .then((result) => setMyRequests(result.requests ?? []))
      .catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-semibold">Profil için giriş gerekli</h1>
        <p className="mt-3 text-muted-foreground">Firma bilgilerini görmek için oturum aç.</p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    try {
      const result = await updateUser(user.id, { fullName, companyName, phone, role, city });
      if (!result.user) throw new Error("Profil yanıtı alınamadı.");
      saveUser({ ...result.user, warning: result.warning, source: result.source });
      setStatus(result.warning ?? null);
      setSaved(true);
      setEditOpen(false);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Profil güncellenemedi.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const totalTonnage = myListings.reduce((s, l) => s + l.tonnage, 0);
  const totalValue = myListings.reduce((s, l) => s + l.tonnage * l.pricePerTonTRY, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile hero */}
      <div className="rounded-xl bg-[var(--cave)] text-background p-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[var(--ember)] opacity-10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[var(--ember)]/30 flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-background/80" />
            </div>
            <div>
              <div className="font-display text-3xl font-semibold">{user.companyName}</div>
              <div className="mt-1 flex flex-wrap gap-3 text-sm text-background/60">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> {user.fullName}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {user.city}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> {roleLabel(user.role)}
                </span>
              </div>
              <div className="mt-2 text-xs text-background/40">{user.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-md border border-background/20 px-3 py-2 text-sm font-semibold text-background/80 hover:bg-background/10"
            >
              <Pencil className="w-3.5 h-3.5" />
              Düzenle
              {editOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-md border border-background/20 px-3 py-2 text-sm font-semibold text-background/80 hover:bg-background/10"
            >
              <LogOut className="w-3.5 h-3.5" /> Çıkış
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px bg-background/10 rounded-lg overflow-hidden border border-background/10">
          {[
            { label: "Aktif İlan", value: myListings.length.toString() },
            { label: "Toplam Stok", value: `${totalTonnage} t` },
            {
              label: "Pazar Değeri",
              value: totalValue > 0 ? `₺${(totalValue / 1_000_000).toFixed(1)}M` : "—",
            },
            { label: "Teklif Talebi", value: myRequests.length.toString() },
          ].map((s) => (
            <div key={s.label} className="bg-background/5 backdrop-blur px-5 py-4">
              <div className="font-display text-2xl font-semibold text-background">{s.value}</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-background/50 mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit form (collapsible) */}
      {editOpen && (
        <form
          onSubmit={onSubmit}
          className="mt-4 rounded-xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-4">
            Profil Bilgileri
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ad Soyad">
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="profile-input"
              />
            </Field>
            <Field label="Firma / Kurum">
              <input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="profile-input"
              />
            </Field>
            <Field label="E-posta">
              <input value={user.email} disabled className="profile-input opacity-60" />
            </Field>
            <Field label="Telefon">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="profile-input"
              />
            </Field>
            <Field label="Rol">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="profile-input"
              >
                <option value="producer">Üretici</option>
                <option value="buyer">Alıcı</option>
                <option value="both">Üretici + Alıcı</option>
              </select>
            </Field>
            <Field label="Şehir / Bölge">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="profile-input"
              >
                {TURKEY_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} · {c.region}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button className="rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:opacity-90 text-sm">
              Kaydet
            </button>
            {saved && (
              <span className="text-sm font-semibold text-[var(--moss-deep)]">Kaydedildi ✓</span>
            )}
            {status && <span className="text-sm text-muted-foreground">{status}</span>}
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-border/60">
        {(
          [
            { key: "listings", label: "İlanlarım", icon: PackageCheck },
            { key: "requests", label: "Tekliflerim", icon: Truck },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === key ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}
            >
              {key === "listings" ? myListings.length : myRequests.length}
            </span>
          </button>
        ))}
      </div>

      {/* Listings tab */}
      {activeTab === "listings" && (
        <div className="mt-6">
          {myListings.length === 0 ? (
            <EmptyState
              icon={<PackageCheck className="w-8 h-8" />}
              title="Henüz aktif ilan yok"
              description="İlk ilanını oluşturarak malzemeni potansiyel alıcılarla buluştur."
              action={{ label: "İlan Ver", to: "/sell" }}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.map((l) => (
                <Link
                  key={l.id}
                  to="/listing/$id"
                  params={{ id: l.id }}
                  className="group rounded-xl border border-border/60 bg-card p-5 hover:shadow-[var(--shadow-card)] transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
                      {CATEGORY_LABELS[l.category]}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--moss-deep)] font-semibold">
                      {VEHICLE_LABELS[l.vehicle]}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {l.title}
                  </h3>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-mono font-semibold">{fmtTRY(l.pricePerTonTRY)}/ton</span>
                    <span className="text-muted-foreground">{l.tonnage} ton</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {l.city}
                    </span>
                    <span className="flex items-center gap-1 text-primary font-semibold">
                      Detay <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <Link
              to="/sell"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Yeni İlan Ver <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Requests tab */}
      {activeTab === "requests" && (
        <div className="mt-6">
          {myRequests.length === 0 ? (
            <EmptyState
              icon={<Truck className="w-8 h-8" />}
              title="Henüz teklif talebi yok"
              description="Pazaryerindeki ilanlara teklif ver ve burada takip et."
              action={{ label: "Pazaryerini Gez", to: "/marketplace" }}
            />
          ) : (
            <div className="grid gap-3">
              {myRequests.map((r) => (
                <div key={r.id} className="rounded-xl border border-border/60 bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground font-mono">
                        #{r.id.slice(0, 10).toUpperCase()}
                      </div>
                      <h3 className="mt-1 font-display text-lg font-semibold">{r.listingTitle}</h3>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Satıcı: <span className="text-foreground font-semibold">{r.seller}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display text-xl font-semibold">{r.quantityTon} ton</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                      </div>
                    </div>
                  </div>
                  {r.note && (
                    <div className="mt-3 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground leading-relaxed">
                      {r.note}
                    </div>
                  )}
                  {r.totalCostTRY !== undefined ? (
                    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-4">
                      <div className="rounded-lg bg-secondary px-3 py-2">
                        <span className="block text-muted-foreground">Konum</span>
                        <strong>{r.buyerLocationLabel ?? "—"}</strong>
                      </div>
                      <div className="rounded-lg bg-secondary px-3 py-2">
                        <span className="block text-muted-foreground">Mesafe</span>
                        <strong>{r.distanceKm?.toFixed(0) ?? "—"} km</strong>
                      </div>
                      <div className="rounded-lg bg-secondary px-3 py-2">
                        <span className="block text-muted-foreground">CO₂</span>
                        <strong>{r.co2Kg?.toFixed(0) ?? "—"} kg</strong>
                      </div>
                      <div className="rounded-lg bg-primary/10 px-3 py-2 text-[var(--moss-deep)]">
                        <span className="block">Toplam</span>
                        <strong>{fmtTRY(r.totalCostTRY)}</strong>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`.profile-input{width:100%;padding:0.7rem 0.9rem;border-radius:0.5rem;background:var(--background);border:1px solid var(--border);font-size:0.9rem;outline:none}.profile-input:focus{box-shadow:0 0 0 3px color-mix(in oklab, var(--ring) 30%, transparent)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: { label: string; to: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
      <Link
        to={action.to as "/sell" | "/marketplace"}
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        {action.label} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function roleLabel(role: UserRole) {
  if (role === "producer") return "Üretici";
  if (role === "buyer") return "Alıcı";
  return "Üretici + Alıcı";
}
