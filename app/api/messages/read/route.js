import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const tokenData = await getCurrentUser();
    if (!tokenData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { withUserId } = await request.json();
    await connectDB();

    // Men uchun yuborilgan xabarlarni o'qildi deb belgilash
    await Message.updateMany(
      {
        sender: withUserId,
        receiver: tokenData.userId,
        readBy: { $nin: [tokenData.userId] },
      },
      { $addToSet: { readBy: tokenData.userId } },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
