import { cookies } from "next/headers";
import { profiles } from "@/lib/demo-data";

export const AUTH_COOKIE = "tortu_session";

export type AuthSession = {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  role: "producer" | "buyer" | "both";
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  onboardingComplete: boolean;
  provider: "supabase" | "demo";
};

export function encodeSession(session: AuthSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

export function decodeSession(value?: string): AuthSession | null {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AuthSession;
  } catch {
    return null;
  }
}

export function getAuthSession() {
  return decodeSession(cookies().get(AUTH_COOKIE)?.value);
}

export function demoSessionForEmail(email: string): AuthSession | null {
  const normalized = email.trim().toLowerCase();
  const profile = profiles.find((item) => item.email.toLowerCase() === normalized);
  if (!profile) return null;
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    companyName: profile.company_name,
    role: profile.role,
    city: profile.city,
    address: profile.address,
    latitude: profile.latitude,
    longitude: profile.longitude,
    onboardingComplete: true,
    provider: "demo"
  };
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  };
}
