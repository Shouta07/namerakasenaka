import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isDemoMode } from "@/lib/demo";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/invite",
  "/counseling",
  "/share",
  "/lessons-preview",
  "/story",
  "/plans",
  "/api/stripe/webhook",
  "/api/daily-checks",
];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PATHS.some((p) => p !== "/" && pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  // Demo mode: Supabase env unset. Every route is browseable with fixture data,
  // no auth redirects, no session cookie reads.
  if (isDemoMode()) {
    return NextResponse.next({ request });
  }

  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (isPublic(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and image optimizer.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
