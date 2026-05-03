import { SignupForm } from "@/components/auth/SignupForm";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <div className="mx-auto grid min-h-[76vh] max-w-md place-items-center px-4 py-10">
      <Card className="w-full p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">Satıcı ve alıcı hesabı</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Kayıt ol</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Kayıt sonrası şirket konumunu tamamlayıp marketplace içinde ilan açabilir veya satın alma talebi oluşturabilirsin.
        </p>
        <div className="mt-6">
          <SignupForm />
        </div>
      </Card>
    </div>
  );
}
