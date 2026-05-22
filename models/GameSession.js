
// models/GameSession.js
// O'yin sessiyasi modeli — kim kimni o'yinga taklif qildi, natijalar
 
import mongoose from 'mongoose';
 
const GameSessionSchema = new mongoose.Schema(
  {
    // O'yin turi
    gameId: {
      type: String,
      required: true,
      enum: ['tic-tac-toe', 'chess', 'snake', 'pong', 'memory-cards'],
    },
 
    // O'yin nomi (ko'rsatish uchun)
    gameName: {
      type: String,
      required: true,
    },
 
    // O'yin holati
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'declined'],
      default: 'pending',
    },
 
    // O'yinchilar
    players: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['host', 'guest'],
        },
        score: {
          type: Number,
          default: 0,
        },
        ready: {
          type: Boolean,
          default: false,
        },
      },
    ],
 
    // G'olibning User IDsi (o'yin tugaganda)
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
 
    // O'yin ma'lumotlari (har bir o'yin o'zining state'ini saqlaydi)
    gameState: {
      type: mongoose.Schema.Types.Mixed, // Flexible JSON
      default: {},
    },
 
    // O'yin qachon boshlandi
    startedAt: {
      type: Date,
      default: null,
    },
 
    // O'yin qachon tugadi
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
 
export default mongoose.models.GameSession || mongoose.model('GameSession', GameSessionSchema);

