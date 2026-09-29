import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { withTimeout } from "@/lib/supabase/withTimeout";

/**
 * Middleware:
 *   - Refreshes the Supabase session cookie on every request.
 *   - Redirects unauthenticated users away from protected app pages.
 *   - Redirects already-authenticated users away from /login and /signup.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // If Supabase is unreachable, treat the visitor as signed out rather than
  // stalling the page while the SDK retries the token refresh.
  const session = await withTimeout(
    supabase.auth.getSession().then(({ data }) => data.session),
    3000,
    null
  );

  const pathname = request.nextUrl.pathname;

  const protectedRoutes = ["/analyze", "/results", "/history"];
  const isProtectedRoute = protectedRoutes.some((p) => pathname.startsWith(p));

  const authRoutes = ["/login", "/signup"];
  const isAuthRoute = authRoutes.some((p) => pathname === p);

  if (isProtectedRoute && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && session) {
    const url = request.nextUrl.clone();
    url.pathname = "/analyze";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
