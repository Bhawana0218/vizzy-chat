import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import nodeFetch from "node-fetch";

const supabaseFetch: typeof fetch = (input, init) =>
  nodeFetch(input as Parameters<typeof nodeFetch>[0], {
    ...(init as Parameters<typeof nodeFetch>[1]),
    timeout: 30000,
  }) as unknown as ReturnType<typeof fetch>;

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase URL or anon key not configured");
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    global: {
      fetch: supabaseFetch,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore
        }
      },
    },
  });
}
