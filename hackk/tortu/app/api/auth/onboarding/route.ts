import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, decodeSession, encodeSession, sessionCookieOptions } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const current = decodeSession(req.cookies.get(AUTH_COOKIE)?.value);
    if (!current) return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });

    const { city, address, latitude, longitude } = await req.json();
    if (!city || !address || typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ error: "Şehir, adres ve koordinat zorunlu" }, { status: 400 });
    }

    const session = { ...current, city, address, latitude, longitude, onboardingComplete: true };
    const res = NextResponse.json({ user: session, redirectTo: "/dashboard" });
    res.cookies.set(AUTH_COOKIE, encodeSession(session), sessionCookieOptions());
    return res;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Profil tamamlanamadı" }, { status: 500 });
  }
}
