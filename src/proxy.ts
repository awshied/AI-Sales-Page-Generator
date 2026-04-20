// This file should be middleware of Next.js
import { auth } from "@/src/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return;
  }

  console.log(`🔍 Middleware - Path: ${pathname}, IsLoggedIn: ${isLoggedIn}`);

  const protectedRoutes = ["/dashboard", "/history", "/preview"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.url));
  }

  return;
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/history/:path*",
    "/preview/:path*",
    "/login",
    "/register",
  ],
};
