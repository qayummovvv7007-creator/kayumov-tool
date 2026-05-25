// app/api/users/delete/route.js
// DELETE /api/users/delete — foydalanuvchi hisobini o'chirish

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Message from "@/models/Message";
import { getCurrentUser, clearAuthCookie } from "@/lib/auth";

export async function DELETE() {
  try {
    const tokenData = await getCurrentUser();
    if (!tokenData)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    // Foydalanuvchining barcha xabarlarini o'chirish
    await Message.deleteMany({
      $or: [
        { sender: tokenData.userId },
        { receiver: tokenData.userId },
      ],
    });

    // Foydalanuvchini o'chirish
    const deleted = await User.findByIdAndDelete(tokenData.userId);
    if (!deleted)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Cookie ni o'chirish
    await clearAuthCookie();

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("[/api/users/delete]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}