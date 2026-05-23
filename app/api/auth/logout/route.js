import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  // ✅ await qo'shildi
  await clearAuthCookie();
  return NextResponse.json({ message: "Logged out successfully" });
}
