"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthSession } from "@/lib/auth/session";

export function AuthActions({ user }: { user: AuthSession | null }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/login">Giriş</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">Kayıt Ol</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/dashboard">
          <UserCircle className="h-4 w-4" />
          {user.companyName}
        </Link>
      </Button>
      <Button size="sm" variant="ghost" onClick={logout} disabled={loading}>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
