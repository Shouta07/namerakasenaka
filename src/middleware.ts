import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { appMode } from "@/lib/app-mode";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/invite",
  "/counseling",
  "/share",
  "/lessons-preview",
  "/story",
  "/plans",
  "/vitality-design",
  "/hub",
  "/api/stripe/webhook",
  "/api/daily-checks",
];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PATHS.some((p) => p !== "/" && pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const mode = appMode();

  // 設定が壊れている本番は、開かずに落とす。
  // 「認証が外れたまま動き続ける」より「動かない」ほうが安全。
  if (mode.fatal) {
    return new NextResponse(
      "設定が正しくないため起動できません。管理者にご連絡ください。",
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  // デモは全ルート素通し（フィクスチャで動く見本なので認証の対象が無い）。
  // ただし素通しにするのは、デモだと**宣言または確定**できたときだけ。
  if (mode.mode === "demo") {
    const res = NextResponse.next({ request });
    // 見本のデータであることを、機械にも分かる形で明示する。
    res.headers.set("x-vitality-design-mode", "demo");
    // デモが検索に載ると、見本の数値が実在の情報として拡散しうる。
    res.headers.set("x-robots-tag", "noindex, nofollow");
    return res;
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
