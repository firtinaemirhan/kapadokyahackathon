"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          companyName: form.get("companyName"),
          role: form.get("role"),
          email: form.get("email"),
          password: form.get("password")
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kayıt başarısız");
      router.push(data.redirectTo ?? "/onboarding");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Ad soyad</Label>
        <Input id="fullName" name="fullName" defaultValue="Demo Alıcı" required className="mt-2" />
      </div>
      <div>
        <Label htmlFor="companyName">Şirket</Label>
        <Input id="companyName" name="companyName" defaultValue="Demo Döngüsel Üretim A.Ş." required className="mt-2" />
      </div>
      <div>
        <Label htmlFor="role">Rol</Label>
        <Select id="role" name="role" defaultValue="both" className="mt-2 w-full" required>
          <option value="producer">Üretici / satıcı</option>
          <option value="buyer">Alıcı</option>
          <option value="both">Her ikisi</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" name="email" type="email" defaultValue="demo@tortu.app" required className="mt-2" />
      </div>
      <div>
        <Label htmlFor="password">Şifre</Label>
        <Input id="password" name="password" type="password" defaultValue="Tortu2026!" minLength={6} required className="mt-2" />
      </div>
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <Button disabled={loading} className="w-full">
        <UserPlus className="h-4 w-4" />
        {loading ? "Kayıt oluşturuluyor" : "Kayıt Ol ve Devam Et"}
      </Button>
      <p className="text-center text-sm text-stone-600">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="font-medium text-emerald-800 underline">
          Giriş yap
        </Link>
      </p>
    </form>
  );
}
