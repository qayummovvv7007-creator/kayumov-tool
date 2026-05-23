// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const tokenData = await getCurrentUser();

    if (!tokenData) {
      // ✅ Har doim to'liq JSON qaytarish
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(tokenData.userId).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
        isOnline: user.isOnline,
      },
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    // ✅ Xato bo'lsa ham JSON qaytarish (hech qachon bo'sh response emas)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
