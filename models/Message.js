// models/Message.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // ✅ DM uchun receiver qo'shildi
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null = global chat
    },
    content: {
      type: String,
      required: [true, "Message content cannot be empty"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    type: {
      type: String,
      enum: ["text", "image", "system"],
      default: "text",
    },
    room: {
      type: String,
      default: "global",
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

MessageSchema.index({ room: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, receiver: 1 });

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
