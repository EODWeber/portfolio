import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

export async function createSupabaseServerClient() {
  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) {
    throw new Error(
      "Supabase URL or anon key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set via Doppler or .env.",
    );
  }
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        const cookieOptions: Partial<CookieOptions> = options ?? {};
        try {
          cookieStore.set({
            name,
            value,
            ...cookieOptions,
            path: cookieOptions.path ?? "/",
          });
        } catch {
          // No-op: Next.js prevents cookie mutation outside server actions/route handlers.
        }
      },
      remove(name, options) {
        const cookieOptions: Partial<CookieOptions> = options ?? {};
        try {
          cookieStore.set({
            name,
            value: "",
            ...cookieOptions,
            path: cookieOptions.path ?? "/",
            maxAge: 0,
          });
        } catch {
          // No-op when cookie mutations are disallowed in this context.
        }
      },
    },
  });
}
