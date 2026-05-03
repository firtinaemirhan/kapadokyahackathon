import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="mx-auto grid min-h-[76vh] max-w-md place-items-center px-4 py-10">
      <Card className="w-full p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">Tortu marketplace</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Giriş yap</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Demo için `buyer1@tortu.app / Tortu2026!` ile giriş yapabilir veya yeni hesap oluşturabilirsin.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </Card>
    </div>
  );
}
