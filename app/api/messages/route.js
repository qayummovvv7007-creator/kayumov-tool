// app/api/messages/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/auth";

// GET — xabarlar tarixini olish
export async function GET(request) {
  try {
    const tokenData = await getCurrentUser();
    if (!tokenData)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(request.url);
    const withUser = searchParams.get("withUser");
    const room = searchParams.get("room") || "global";
    const limit = parseInt(searchParams.get("limit") || "50");

    let query;
    if (withUser) {
      query = {
        $or: [
          { sender: tokenData.userId, receiver: withUser },
          { sender: withUser, receiver: tokenData.userId },
        ],
      };
    } else {
      query = { room, receiver: null };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar")
      .lean();

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("[GET /api/messages]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ✅ POST — xabar yuborish (socket server o'rniga HTTP orqali)
export async function POST(request) {
  try {
    const tokenData = await getCurrentUser();
    if (!tokenData)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const body = await request.json();
    const { receiverId, content } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const message = await Message.create({
      sender: tokenData.userId,
      receiver: receiverId || null,
      content: content.trim(),
      type: "text",
      room: receiverId ? "dm" : "global",
    });

    const populated = await Message.findById(message._id)
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar")
      .lean();

    return NextResponse.json({ message: populated }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/messages]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
