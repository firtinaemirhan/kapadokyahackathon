import { createFileRoute } from "@tanstack/react-router";
import { AuthExperience } from "@/components/AuthExperience";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Kayıt Ol — Tortu" },
      {
        name: "description",
        content: "Tortu üretici ve alıcı hesabınızı oluşturun.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  return <AuthExperience initialMode="signup" />;
}
