import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { AUTH_COOKIE, AuthSession, encodeSession, sessionCookieOptions } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, companyName, role } = await req.json();
    if (!email || !password || !fullName || !companyName || !role) {
      return NextResponse.json({ error: "Tüm kayıt alanları zorunlu" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    let id = `demo-${crypto.randomUUID()}`;
    let provider: AuthSession["provider"] = "demo";

    if (supabaseUrl && supabaseKey) {
      const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, company_name: companyName, role, onboarding_complete: false } }
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      if (data.user?.id) {
        id = data.user.id;
        provider = "supabase";
      }
    }

    const session: AuthSession = {
      id,
      email,
      fullName,
      companyName,
      role,
      onboardingComplete: false,
      provider
    };
    const res = NextResponse.json({ user: session, redirectTo: "/onboarding" });
    res.cookies.set(AUTH_COOKIE, encodeSession(session), sessionCookieOptions());
    return res;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Kayıt oluşturulamadı" }, { status: 500 });
  }
}
