// lib/auth.js
// JWT token yaratish va tekshirish yordamchi funksiyalar

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_NAME = "kayumov_auth_token";
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 kun (soniyalarda)

// ===== TOKEN YARATISH =====
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_MAX_AGE,
  });
}

// ===== TOKENNI TEKSHIRISH =====
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null; // Token noto'g'ri yoki muddati o'tgan
  }
}

// ===== COOKIE GA TOKEN SAQLASH =====
export function setAuthCookie(token) {
  const cookieStore = cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true, // JavaScript orqali o'qib bo'lmaydi (XSS himoyasi)
    secure: process.env.NODE_ENV === "production", // HTTPS da ishlaydi
    sameSite: "lax", // CSRF himoyasi
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

// ===== COOKIE DAN TOKENNI O'CHIRISH =====
export function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete(TOKEN_NAME);
}

// ===== JORIY FOYDALANUVCHINI OLISH =====
export function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
