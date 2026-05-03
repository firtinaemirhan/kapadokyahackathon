import { NextResponse, type NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (!request.cookies.get("NEXT_LOCALE")) {
    response.cookies.set("NEXT_LOCALE", "tr");
  }
  return response;
}

export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
