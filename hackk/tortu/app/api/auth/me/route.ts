import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";

export async function GET() {
  return NextResponse.json({ user: getAuthSession() });
}
