// lib/mongodb.js
// MongoDB ulanish singleton — har safar yangi ulanish ochilmasligi uchun
// Next.js hot reload paytida ham faqat bitta ulanish bo'ladi

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI environment variable is not defined in .env.local",
  );
}

// Global o'zgaruvchi — Next.js development rejimida hot reload da saqlanadi
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Allaqachon ulangan bo'lsa, mavjud ulanishni qaytarish
  if (cached.conn) {
    return cached.conn;
  }

  // Ulanish jarayoni boshlangan bo'lsa, uni kutish
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Ulanmasdan oldin komandalarni bufer qilma
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB connected");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
