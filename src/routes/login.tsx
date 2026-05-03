import { createFileRoute } from "@tanstack/react-router";
import { AuthExperience } from "@/components/AuthExperience";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Giriş Yap — Tortu" },
      {
        name: "description",
        content: "Tortu hesabınıza giriş yapın.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return <AuthExperience initialMode="login" />;
}
