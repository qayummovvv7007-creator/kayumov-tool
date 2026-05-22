
// models/Message.js
// Chat xabarlari modeli — barcha xabarlar MongoDB da saqlanadi
 
import mongoose from 'mongoose';
 
const MessageSchema = new mongoose.Schema(
  {
    // Xabar yuborganv foydalanuvchi (User ga reference)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
 
    // Xabar matni
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
 
    // Xabar turi — kelajakda kengaytirish uchun
    type: {
      type: String,
      enum: ['text', 'image', 'system'], // system = "X joined the chat"
      default: 'text',
    },
 
    // Global chat yoki keyinroq private chat uchun room ID
    room: {
      type: String,
      default: 'global', // Hozircha faqat global chat
    },
 
    // Xabar o'qildimi (private chat uchun keyinroq)
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);
 
// Eng so'nggi xabarlarni tez olish uchun index
MessageSchema.index({ room: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
 
export default mongoose.models.Message || mongoose.model('Message', MessageSchema);

