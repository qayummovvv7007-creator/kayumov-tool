// app/api/users/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const tokenData = await getCurrentUser();
    if (!tokenData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const users = await User.find({})
      .select("username avatar isOnline lastSeen")
      .lean();

    return NextResponse.json({
      users: users.map((u) => ({
        id: u._id.toString(),
        _id: u._id.toString(),
        username: u.username,
        avatar:
          u.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
        isOnline: u.isOnline,
        lastSeen: u.lastSeen,
      })),
    });
  } catch (error) {
    console.error("[/api/users]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
