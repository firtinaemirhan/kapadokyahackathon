"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Upload } from "lucide-react";
import { LocationPicker } from "@/components/map/LocationPicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function NewListingPage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setHasSession(Boolean(data.user)))
      .catch(() => setHasSession(false));
  }, []);

  async function classify() {
    const res = await fetch("/api/classify-waste", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Avanos seramik atölyesinden kırık şamot ve seramik fire" })
    });
    const data = await res.json();
    setSuggestions(data.suggestions ?? []);
  }

  if (hasSession === false) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-6 text-center">
          <h1 className="font-serif text-3xl font-semibold">İlan açmak için giriş yap</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">Marketplace satıcı işlemleri oturum gerektirir.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/login">Giriş Yap</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signup">Kayıt Ol</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-4xl font-semibold">3 adımda ilan oluştur</h1>
      <div className="mt-8 grid gap-5">
        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">1. Fotoğraf ve AI önerisi</h2>
          <Button variant="outline">
            <Upload className="h-4 w-4" /> Fotoğraf yükle
          </Button>
          <Label>Başlık</Label>
          <Input defaultValue="Kırık şamot ve seramik fire" />
          <Label>Açıklama</Label>
          <Textarea defaultValue="Avanos seramik üretiminden temiz ayrıştırılmış fire." />
          <Button onClick={classify}>
            <Sparkles className="h-4 w-4" /> AI'ya Sor
          </Button>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <span key={item.slug} className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-900">
                {item.slug} · %{Math.round(item.score * 100)}
              </span>
            ))}
          </div>
        </Card>
        <Card className="grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="font-semibold sm:col-span-2">2. Ticari detay</h2>
          <Input defaultValue="2" />
          <Select defaultValue="ton">
            <option>ton</option>
            <option>kg</option>
            <option>m3</option>
          </Select>
          <Input defaultValue="1500" />
          <Select defaultValue="road">
            <option>road</option>
            <option>rail</option>
            <option>sea</option>
            <option>air</option>
          </Select>
        </Card>
        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">3. Alım konumu</h2>
          <LocationPicker lat={38.717} lng={34.848} />
          <Button>İlanı Yayınla</Button>
        </Card>
      </div>
    </div>
  );
}
