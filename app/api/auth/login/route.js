import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    // 1. Body ni o'qish
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }

    // 2. MongoDB ga ulanish
    try {
      await connectDB();
    } catch (dbErr) {
      console.error("❌ DB Connection Error:", dbErr.message);
      return NextResponse.json(
        { error: `Database connection failed: ${dbErr.message}` },
        { status: 500 },
      );
    }

    // 3. Foydalanuvchini topish
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // 4. Parolni tekshirish
    let isPasswordCorrect;
    try {
      isPasswordCorrect = await user.comparePassword(password);
    } catch (bcryptErr) {
      console.error("❌ Bcrypt Error:", bcryptErr.message);
      return NextResponse.json(
        { error: "Password check failed" },
        { status: 500 },
      );
    }

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // 5. Token yaratish
    const token = signToken({
      userId: user._id.toString(),
      username: user.username,
    });

    // 6. Cookie saqlash
    await setAuthCookie(token);

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
      },
    });
  } catch (error) {
    console.error("❌ LOGIN FULL ERROR:", error.message);
    console.error(error.stack);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
