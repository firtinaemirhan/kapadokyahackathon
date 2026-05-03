import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginUser, signupUser } from "@/lib/api-client";
import { saveUser } from "@/lib/auth";
import { ArrowRight, Coins, Leaf, Route as RouteIcon } from "lucide-react";

type AuthMode = "login" | "signup";

export function AuthExperience({ initialMode = "login" }: { initialMode?: AuthMode }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const result = isSignup
        ? await signupUser({
            fullName,
            companyName,
            email,
            phone,
            role: "producer",
            city: "Nevşehir",
          })
        : await loginUser({ email, password });

      if (!result.user) throw new Error("Kullanıcı yanıtı alınamadı.");
      saveUser({ ...result.user, warning: result.warning, source: result.source });
      navigate({ to: "/profile" });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "İşlem tamamlanamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--ember)_18%,transparent),transparent_34%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--moss)_20%,transparent),transparent_32%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="flex rounded-lg bg-[var(--cave)] p-8 text-background shadow-[var(--shadow-card)]">
          <div className="flex h-full flex-col justify-between">
            <div>
              <h1 className="max-w-xl font-display text-4xl font-semibold leading-tight">
                Üretici profilinizi, stok bilgilerinizi ve ilanlarınızı tek hesapta yönetin.
              </h1>
              <p className="mt-5 max-w-lg text-background/70">
                Tortu, Kapadokya&apos;daki endüstriyel yan ürünleri ton bazında listeleyerek döngüsel
                ekonomiye katılımı destekler. Hesabınızı buradan oluşturabilir veya giriş
                yapabilirsiniz; ilan kartlarında güncel kur, hesaplanmış rota mesafesi ve karbon
                göstergesi birlikte yer alır.
              </p>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <AuthBenefit
                  icon={<Coins />}
                  title="Canlı kur"
                  text="TCMB kaynaklı güncel döviz bilgisi kullanılır; tutar TL olarak gösterilir, kur hareketine göre marj göstergesi üretilir."
                />
                <AuthBenefit
                  icon={<RouteIcon />}
                  title="Gerçek mesafe"
                  text="Kuş uçuşu mesafe yerine araç tipine uygun rota baz alınır; mesafe ve süre bu hesaba dayanır."
                />
                <AuthBenefit
                  icon={<Leaf />}
                  title="Karbon metre"
                  text="Sevkiyat bazında kg CO₂ hesabı ilanda görünür; sürdürülebilirlik ve raporlama süreçlerinde kullanılabilir."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="flex rounded-lg border border-border/60 bg-card/90 p-4 shadow-[var(--shadow-card)] backdrop-blur">
          <div className="flex w-full flex-col">
            <div className="grid grid-cols-2 rounded-lg bg-secondary p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-md px-4 py-3 text-sm font-semibold transition ${
                  !isSignup
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`rounded-md px-4 py-3 text-sm font-semibold transition ${
                  isSignup
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Kayıt Ol
              </button>
            </div>

            <form
              onSubmit={onSubmit}
              className={`flex flex-1 flex-col gap-4 p-4 sm:p-6 ${isSignup ? "justify-start" : "justify-center"}`}
            >
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {isSignup ? "Yeni hesap" : "Hoş geldiniz"}
                </div>
                <h2 className="mt-2 font-display text-3xl font-semibold">
                  {isSignup ? "Tortu hesabınızı oluşturun" : "Hesabınıza giriş yapın"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isSignup
                    ? "Firma ve iletişim bilgilerinizi girin. Kayıt tamamlandığında üretici profilinize yönlendirilirsiniz."
                    : "Kayıtlı e-posta adresiniz ve şifreniz ile oturum açın."}
                </p>
              </div>

              {isSignup && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Ad Soyad">
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="auth-input"
                    />
                  </Field>
                  <Field label="Firma / Kurum">
                    <input
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="auth-input"
                    />
                  </Field>
                </div>
              )}

              <Field label="E-posta">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                />
              </Field>
              <Field label="Şifre">
                <input
                  required
                  minLength={4}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                />
              </Field>

              {isSignup && (
                <Field label="Telefon">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="auth-input"
                  />
                </Field>
              )}

              {status && (
                <div className="rounded-md border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-3 text-sm">
                  {status}
                </div>
              )}

              <div className="space-y-4 pt-2">
                <button
                  disabled={submitting}
                  className="group flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                >
                  {submitting ? "İşleniyor..." : isSignup ? "Kayıt Ol" : "Giriş Yap"}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>

                <p className="text-center text-sm text-muted-foreground">
                  {isSignup ? "Zaten hesabın var mı?" : "Hesabın yok mu?"}{" "}
                  <button
                    type="button"
                    onClick={() => setMode(isSignup ? "login" : "signup")}
                    className="font-semibold text-foreground"
                  >
                    {isSignup ? "Giriş yap" : "Kayıt ol"}
                  </button>
                  {" · "}
                  <Link to="/" className="font-semibold text-foreground">
                    Ana sayfa
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
      <style>{`.auth-input{width:100%;padding:0.78rem 0.95rem;border-radius:0.5rem;background:var(--background);border:1px solid var(--border);font-size:0.92rem;outline:none;transition:box-shadow .15s,border-color .15s}.auth-input:focus{border-color:var(--ring);box-shadow:0 0 0 3px color-mix(in oklab,var(--ring) 26%,transparent)}`}</style>
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

function AuthBenefit({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg bg-background/10 p-4">
      <div className="[&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <div className="mt-3 font-semibold">{title}</div>
      <p className="mt-1 text-sm text-background/65">{text}</p>
    </div>
  );
}
