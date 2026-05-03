export type UserRole = "producer" | "buyer" | "both";

export interface AuthUser {
  id: string;
  fullName: string;
  companyName: string;
  email: string;
  role: UserRole;
  city: string;
  phone?: string;
  createdAt: string;
  source?: string;
  warning?: string | null;
}

let currentUser: AuthUser | null = null;

export function getStoredUser(): AuthUser | null {
  return currentUser;
}

export function saveUser(user: AuthUser) {
  currentUser = user;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("tortu-auth-change"));
  }
}

export function clearUser() {
  currentUser = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("tortu-auth-change"));
  }
}
