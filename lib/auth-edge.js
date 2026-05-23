// lib/auth-edge.js
// Faqat middleware uchun — Edge Runtime da ishlaydi

import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function verifyTokenEdge(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}
