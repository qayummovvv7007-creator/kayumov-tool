import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request) {
  try {
    // ✅ await qo'shildi
    const tokenData = await getCurrentUser();
    if (!tokenData)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { avatar, theme } = await request.json();
    await connectDB();

    const updateData = {};
    if (avatar !== undefined) updateData.avatar = avatar;
    if (theme !== undefined) updateData.theme = theme;

    const user = await User.findByIdAndUpdate(
      tokenData.userId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
