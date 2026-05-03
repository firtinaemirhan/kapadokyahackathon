import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { Card } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth/session";

export default function OnboardingPage() {
  const session = getAuthSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Card className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">Konum doğrulama</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Profil ve şirket konumu</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Kural 3 için adresi Nominatim ile koordinata çeviriyoruz. Bu konum ilan filtreleme ve alıcı karar ekranlarında kullanılır.
        </p>
        <div className="mt-6">
          <OnboardingForm />
        </div>
      </Card>
    </div>
  );
}
