import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Resolve the current Supabase session inside a Next.js API route.
 * Returns the user id if authenticated, otherwise null.
 */
export async function getAuthedUserId(): Promise<string | null> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // API routes don't need to mutate cookies for read-only auth checks.
        set(_name: string, _value: string, _options: CookieOptions) {},
        remove(_name: string, _options: CookieOptions) {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
