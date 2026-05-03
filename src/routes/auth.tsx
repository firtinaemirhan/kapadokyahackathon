import { createFileRoute } from "@tanstack/react-router";
import { AuthExperience } from "@/components/AuthExperience";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Giriş / Kayıt — Tortu" },
      {
        name: "description",
        content: "Tortu giriş ve kayıt ekranı.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return <AuthExperience initialMode="login" />;
}
