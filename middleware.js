// middleware.js
// Himoyalangan sahifalarga kirish nazorati
// Login qilmagan foydalanuvchi /login ga yo'naltiriladi

import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Himoyalangan yo'llar
const PROTECTED_PATHS = ["/chat", "/games", "/settings"];
// Autentifikatsiya yo'llari (login bo'lsa kirmaslik kerak)
const AUTH_PATHS = ["/login", "/signup"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Cookie dan tokenni olish
  const token = request.cookies.get("kayumov_auth_token")?.value;
  const user = token ? verifyToken(token) : null;

  // Himoyalangan sahifaga kirmoqchi, lekin login qilmagan
  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Login/Signup sahifasiga kirmoqchi, lekin allaqachon login qilgan
  if (AUTH_PATHS.some((path) => pathname.startsWith(path))) {
    if (user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
