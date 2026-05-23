
  // socket-server/index.js
  // Bu fayl Render.com da alohida Node.js server sifatida ishlaydi
  // Vercel serverless emas — doimiy WebSocket ulanishlarni saqlaydi
  
  require('dotenv').config();
  const express = require('express');
  const http = require('http');
  const { Server } = require('socket.io');
  const mongoose = require('mongoose');
  const cors = require('cors');
  
  // ===== EXPRESS + HTTP SERVER SOZLASH =====
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
  app.use(express.json());
  
  const server = http.createServer(app);
  
  // ===== SOCKET.IO SOZLASH =====
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Render.com bilan muammosiz ishlash uchun
    pingTimeout: 60000,
    pingInterval: 25000,
  });
  
  // ===== MONGODB ULANISH =====
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected to Socket server'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
  
  // ===== MONGOOSE MODELLARI (server tomonida ham kerak) =====
  const UserSchema = new mongoose.Schema({
    username: String,
    avatar: String,
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    socketId: { type: String, default: null },
  });
  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  
  const MessageSchema = new mongoose.Schema(
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String,
      type: { type: String, default: 'text' },
      room: { type: String, default: 'global' },
    },
    { timestamps: true }
  );
  const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
  
  // ===== ONLINE FOYDALANUVCHILAR MAP =====
  // socketId => { userId, username, avatar }
  const onlineUsers = new Map();
  
  // ===== HEALTH CHECK ENDPOINT =====
  // Render.com uchun — server tirik ekanligini tekshiradi
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      onlineCount: onlineUsers.size,
      timestamp: new Date().toISOString(),
    });
  });
  
  // ===== SOCKET.IO ASOSIY MANTIQ =====
  io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);
  
    // ----- 1. FOYDALANUVCHI AUTENTIFIKATSIYASI -----
    // Client ulanishi bilan userId yuboradi
    socket.on('user:authenticate', async ({ userId, username, avatar }) => {
      try {
        // Foydalanuvchini online qilib belgilash
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          socketId: socket.id,
          lastSeen: new Date(),
        });
  
        // Online users map ga qo'shish
        onlineUsers.set(socket.id, { userId, username, avatar });
  
        // Socket ga user ID ni biriktirish
        socket.userId = userId;
        socket.username = username;
  
        // Global chat room ga qo'shish
        socket.join('global');
  
        // Barcha foydalanuvchilarga yangilangan online ro'yxatni yuborish
        const onlineList = Array.from(onlineUsers.values());
        io.emit('users:online-list', onlineList);
  
        // Foydalanuvchiga ulanish muvaffaqiyatli ekanligini bildirish
        socket.emit('user:authenticated', { success: true });
  
        // Barcha chat xabarlarini yuborish (oxirgi 50 ta)
        const messages = await Message.find({ room: 'global' })
          .sort({ createdAt: -1 })
          .limit(50)
          .populate('sender', 'username avatar')
          .lean();
  
        socket.emit('messages:history', messages.reverse());
  
        console.log(`✅ User authenticated: ${username} (${userId})`);
      } catch (err) {
        console.error('Authentication error:', err);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });
  
    // ----- 2. CHAT XABARI YUBORISH -----
    socket.on('message:send', async ({ content, room = 'global' }) => {
      try {
        if (!socket.userId) return;
        if (!content || content.trim().length === 0) return;
        if (content.length > 1000) return;
  
        // MongoDB ga saqlash
        const message = await Message.create({
          sender: socket.userId,
          content: content.trim(),
          room,
          type: 'text',
        });
  
        // Sender ma'lumotlarini to'ldirish
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar')
          .lean();
  
        // Xuddi shu roomdagi BARCHA foydalanuvchilarga yuborish (real-time)
        io.to(room).emit('message:received', populatedMessage);
  
        console.log(`💬 Message from ${socket.username}: ${content.substring(0, 50)}`);
      } catch (err) {
        console.error('Message send error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
  
    // ----- 3. O'YIN TAKLIFI YUBORISH -----
    socket.on('game:invite', ({ targetUserId, gameId, gameName }) => {
      // Maqsad foydalanuvchining socket ID sini topish
      const targetEntry = Array.from(onlineUsers.entries()).find(
        ([, userData]) => userData.userId === targetUserId
      );
  
      if (!targetEntry) {
        socket.emit('game:invite-failed', { reason: 'User is no longer online' });
        return;
      }
  
      const [targetSocketId] = targetEntry;
      const senderData = onlineUsers.get(socket.id);
  
      // Faqat maqsad foydalanuvchiga taklifnoma yuborish
      io.to(targetSocketId).emit('game:invite-received', {
        from: {
          userId: socket.userId,
          username: senderData?.username,
          avatar: senderData?.avatar,
        },
        gameId,
        gameName,
        inviteId: `${socket.id}-${Date.now()}`, // Taklifni identifikatsiya qilish uchun
      });
  
      console.log(`🎮 Game invite: ${socket.username} → ${targetUserId} for ${gameName}`);
    });
  
    // ----- 4. O'YIN TAKLIFIGA JAVOB BERISH -----
    socket.on('game:invite-response', ({ inviteId, accepted, gameId, inviterUserId }) => {
      // Taklif yuboruvchining socket ID sini topish
      const inviterEntry = Array.from(onlineUsers.entries()).find(
        ([, userData]) => userData.userId === inviterUserId
      );
  
      if (!inviterEntry) return;
  
      const [inviterSocketId] = inviterEntry;
      const responderData = onlineUsers.get(socket.id);
  
      if (accepted) {
        // Ikki foydalanuvchini bir game room ga qo'shish
        const gameRoom = `game:${gameId}:${Date.now()}`;
        socket.join(gameRoom);
        io.sockets.sockets.get(inviterSocketId)?.join(gameRoom);
  
        // Ikkalasiga ham o'yin boshlandi xabarini yuborish
        io.to(gameRoom).emit('game:started', {
          gameRoom,
          gameId,
          players: [
            { userId: inviterUserId, username: onlineUsers.get(inviterSocketId)?.username },
            { userId: socket.userId, username: responderData?.username },
          ],
        });
      } else {
        // Taklif rad etildi
        io.to(inviterSocketId).emit('game:invite-declined', {
          by: responderData?.username,
          gameId,
        });
      }
    });
  
    // ----- 5. YOZISH INDIKATORI (typing indicator) -----
    socket.on('chat:typing', ({ room = 'global' }) => {
      // Yozayotgan foydalanuvchi haqida boshqalarga xabar berish
      socket.to(room).emit('chat:user-typing', {
        userId: socket.userId,
        username: socket.username,
      });
    });
  
    socket.on('chat:stop-typing', ({ room = 'global' }) => {
      socket.to(room).emit('chat:user-stopped-typing', {
        userId: socket.userId,
      });
    });
  
    // ----- 6. ULANISH UZILGANDA -----
    socket.on('disconnect', async () => {
      const userData = onlineUsers.get(socket.id);
  
      if (userData) {
        // MongoDB da offline qilish
        await User.findByIdAndUpdate(userData.userId, {
          isOnline: false,
          socketId: null,
          lastSeen: new Date(),
        });
  
        // Map dan olib tashlash
        onlineUsers.delete(socket.id);
  
        // Barcha foydalanuvchilarga yangilangan ro'yxatni yuborish
        const onlineList = Array.from(onlineUsers.values());
        io.emit('users:online-list', onlineList);
  
        console.log(`❌ User disconnected: ${userData.username}`);
      }
    });
  });
  
  // ===== SERVERNI ISHGA TUSHURISH =====
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`🚀 Socket.io server running on port ${PORT}`);
    console.log(`🌍 Accepting connections from: ${process.env.CLIENT_ORIGIN}`);
  });
