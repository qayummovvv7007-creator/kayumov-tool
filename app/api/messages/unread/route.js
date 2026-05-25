import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/auth";

function toStr(id) {
  if (!id) return "";
  return id?.toString ? id.toString() : String(id);
}

export async function GET() {
  try {
    const tokenData = await getCurrentUser();
    if (!tokenData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const unreadMessages = await Message.find({
      receiver: tokenData.userId,
      readBy: { $nin: [tokenData.userId] },
    })
      .select("sender")
      .lean();

    const unread = {};
    unreadMessages.forEach((msg) => {
      const senderId = toStr(msg.sender);
      unread[senderId] = (unread[senderId] || 0) + 1;
    });

    return NextResponse.json({ unread });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
