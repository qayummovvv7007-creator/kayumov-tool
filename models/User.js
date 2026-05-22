
// models/User.js
// Foydalanuvchi modeli — autentifikatsiya va profil ma'lumotlari
 
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
 
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
      // Faqat harf, raqam va pastki chiziq
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
 
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
 
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Odatiy so'rovlarda parolni qaytarma
    },
 
    // Profil rasmi — URL yoki base64 string sifatida saqlash
    avatar: {
      type: String,
      default: '', // Bo'sh bo'lsa, frontend default avatar ko'rsatadi
    },
 
    // Foydalanuvchi tanlagan rang/gradient tema
    theme: {
      type: Object,
      default: {
        bgColor: '#0f172a',           // Asosiy fon rangi (slate-900)
        accentColor: '#3b82f6',       // Accent rang (blue-500)
        gradient: 'none',             // 'none' | 'sunset' | 'ocean' | 'custom'
        customGradient: '',           // Custom CSS gradient string
      },
    },
 
    // Online holat — Socket.io tomonidan yangilanadi
    isOnline: {
      type: Boolean,
      default: false,
    },
 
    // Oxirgi online vaqti
    lastSeen: {
      type: Date,
      default: Date.now,
    },
 
    // Foydalanuvchi qaysi socket ID ga ulangan (real-time uchun)
    socketId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt va updatedAt avtomatik qo'shiladi
  }
);
 
// ===== MIDDLEWARE =====
// Saqlashdan oldin parolni hash qilish
UserSchema.pre('save', async function (next) {
  // Faqat parol o'zgartirilgan bo'lsa hash qil
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
 
// ===== INSTANCE METHODS =====
// Parolni tekshirish metodi
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
 
// JSON ga o'tkazganda parolni olib tashlash
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.socketId;
  return obj;
};
 
// Model allaqachon mavjud bo'lsa qayta yaratma (Next.js hot reload uchun)
export default mongoose.models.User || mongoose.model('User', UserSchema);

