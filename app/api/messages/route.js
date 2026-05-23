// app/api/messages/route.js
// GET /api/messages — oxirgi 50 ta xabarni olish

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request) {
  // ✅ request parametri
  try {
    const user = getCurrentUser(request); // ✅ request uzatildi
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(request.url);
    const room = searchParams.get("room") || "global";
    const limit = parseInt(searchParams.get("limit") || "50");

    const messages = await Message.find({ room })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "username avatar")
      .lean();

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("[/api/messages]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
