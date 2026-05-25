// app/api/users/avatar/route.js
// PATCH /api/users/avatar — avatarni yangilash

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request) {
  console.log("🔥 PATCH /api/users/avatar called"); // ← QO'SHING
  try {
    const tokenData = await getCurrentUser();
    console.log("tokenData:", tokenData); // ← QO'SHING
    if (!tokenData)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { avatar } = await request.json();
    if (!avatar)
      return NextResponse.json(
        { error: "Avatar URL required" },
        { status: 400 },
      );

    await connectDB();

    const user = await User.findByIdAndUpdate(
      tokenData.userId,
      { avatar },
      { new: true },
    )
      .select("-password")
      .lean();

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[/api/users/avatar]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
export async function GET() {
  return NextResponse.json({ message: "avatar route works" });
}
