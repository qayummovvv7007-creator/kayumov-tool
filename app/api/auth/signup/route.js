// app/api/auth/signup/route.js
// POST /api/auth/signup — yangi foydalanuvchi ro'yxatdan o'tish

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    // Input validatsiya
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Email yoki username allaqachon mavjudmi?
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return NextResponse.json(
        { error: `${field} is already taken` },
        { status: 409 },
      );
    }

    // Yangi foydalanuvchi yaratish (parol pre-save hookda hash lanadi)
    const user = await User.create({
      username,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`, // Default avatar
    });

    // JWT token yaratish
    const token = signToken({
      userId: user._id.toString(),
      username: user.username,
    });

    // Token ni httpOnly cookie ga saqlash
    setAuthCookie(token);

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          theme: user.theme,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
