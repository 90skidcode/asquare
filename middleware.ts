import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const ADMIN_ONLY = ["/users"];
const STAFF_AREA = [
  "/dashboard",
  "/vehicles",
  "/investors",
  "/dealers",
  "/customers",
  "/trip-sheets",
  "/reports",
  "/users",
];
const PORTAL_AREA = ["/portal"];

function homeFor(role: string | undefined) {
  return role === "DEALER" || role === "INVESTOR" ? "/portal" : "/dashboard";
}

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const isLoginPage = path === "/login";

  if (!isLoggedIn) {
    if (isLoginPage) return;
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage || path === "/") {
    return NextResponse.redirect(new URL(homeFor(role), nextUrl.origin));
  }

  const isPortalRole = role === "DEALER" || role === "INVESTOR";

  if (isPortalRole && STAFF_AREA.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL("/portal", nextUrl.origin));
  }
  if (!isPortalRole && PORTAL_AREA.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }
  if (role === "STAFF" && ADMIN_ONLY.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp)).*)"],
};
