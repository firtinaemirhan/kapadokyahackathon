import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { AUTH_COOKIE, demoSessionForEmail, encodeSession, sessionCookieOptions } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve şifre zorunlu" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data.user) {
        const session = {
          id: data.user.id,
          email: data.user.email ?? email,
          fullName: String(data.user.user_metadata.full_name ?? data.user.email ?? email),
          companyName: String(data.user.user_metadata.company_name ?? "Tortu şirketi"),
          role: (data.user.user_metadata.role ?? "buyer") as "producer" | "buyer" | "both",
          onboardingComplete: Boolean(data.user.user_metadata.onboarding_complete),
          provider: "supabase" as const
        };
        const res = NextResponse.json({ user: session, redirectTo: session.onboardingComplete ? "/dashboard" : "/onboarding" });
        res.cookies.set(AUTH_COOKIE, encodeSession(session), sessionCookieOptions());
        return res;
      }
    }

    const demo = demoSessionForEmail(email);
    if (!demo || password !== "Tortu2026!") {
      return NextResponse.json({ error: "Giriş başarısız. Demo şifresi: Tortu2026!" }, { status: 401 });
    }
    const res = NextResponse.json({ user: demo, redirectTo: "/dashboard" });
    res.cookies.set(AUTH_COOKIE, encodeSession(demo), sessionCookieOptions());
    return res;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Giriş yapılamadı" }, { status: 500 });
  }
}
