import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const store = cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value, options }) => {
          try {
            store.set(name, value, options);
          } catch {
            // Server Components cannot always mutate cookies; middleware can refresh them.
          }
        });
      }
    }
  });
}
