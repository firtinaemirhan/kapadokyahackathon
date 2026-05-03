import { useEffect, useState } from "react";
import { clearUser, getStoredUser, type AuthUser } from "@/lib/auth";

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    window.addEventListener("tortu-auth-change", sync);

    return () => {
      window.removeEventListener("tortu-auth-change", sync);
    };
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    logout: clearUser,
  };
}
