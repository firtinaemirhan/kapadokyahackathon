"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Giriş başarısız");
      router.push(data.redirectTo ?? "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" name="email" type="email" defaultValue="buyer1@tortu.app" required className="mt-2" />
      </div>
      <div>
        <Label htmlFor="password">Şifre</Label>
        <Input id="password" name="password" type="password" defaultValue="Tortu2026!" required className="mt-2" />
      </div>
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <Button disabled={loading} className="w-full">
        <LogIn className="h-4 w-4" />
        {loading ? "Giriş yapılıyor" : "Giriş Yap"}
      </Button>
      <p className="text-center text-sm text-stone-600">
        Hesabın yok mu?{" "}
        <Link href="/signup" className="font-medium text-emerald-800 underline">
          Kayıt ol
        </Link>
      </p>
    </form>
  );
}
