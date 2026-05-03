"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPinCheck } from "lucide-react";
import { LocationPicker } from "@/components/map/LocationPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OnboardingForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [geoLoading, setGeoLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [location, setLocation] = React.useState({ lat: 38.7205, lng: 35.4826, display: "Kayseri OSB, Melikgazi" });

  async function geocode(address: string) {
    setGeoLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: address })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Adres bulunamadı");
      setLocation({ lat: data.lat, lng: data.lng, display: data.display });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adres bulunamadı");
    } finally {
      setGeoLoading(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: form.get("city"),
          address: form.get("address"),
          latitude: location.lat,
          longitude: location.lng
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Profil tamamlanamadı");
      router.push(data.redirectTo ?? "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profil tamamlanamadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <Label htmlFor="city">Şehir</Label>
        <Input id="city" name="city" defaultValue="Kayseri" required className="mt-2" />
      </div>
      <div>
        <Label htmlFor="address">Şirket adresi</Label>
        <div className="mt-2 flex gap-2">
          <Input id="address" name="address" defaultValue={location.display} required />
          <Button type="button" variant="outline" disabled={geoLoading} onClick={() => geocode((document.getElementById("address") as HTMLInputElement).value)}>
            {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPinCheck className="h-4 w-4" />}
            Geocode
          </Button>
        </div>
      </div>
      <LocationPicker lat={location.lat} lng={location.lng} />
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <Button disabled={loading} className="w-full">
        {loading ? "Profil tamamlanıyor" : "Profili Tamamla ve Panele Git"}
      </Button>
    </form>
  );
}
