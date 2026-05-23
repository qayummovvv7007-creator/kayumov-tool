// lib/auth.js
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_NAME = "kayumov_auth_token";
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

export function signToken(payload) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_MAX_AGE });
}

export function verifyToken(token) {
  try {
    if (!JWT_SECRET) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}
