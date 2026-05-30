// socket-server/index.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ── Models ───────────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  username: String,
  avatar: String,
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  socketId: { type: String, default: null },
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    content: String,
    type: { type: String, default: "text" },
    room: { type: String, default: "global" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);
const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

// ── Online users map ──────────────────────────────────────────────────────────
const onlineUsers = new Map();

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", onlineCount: onlineUsers.size });
});

// ── Socket logic ──────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Connected: ${socket.id}`);

  // 1. AUTH
  socket.on("user:authenticate", async ({ userId, username, avatar }) => {
    try {
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        socketId: socket.id,
        lastSeen: new Date(),
      });

      onlineUsers.set(socket.id, { userId, username, avatar });
      socket.userId = userId;
      socket.username = username;

      socket.join("global");
      socket.join(`user:${userId}`);

      io.emit("users:online-list", Array.from(onlineUsers.values()));
      socket.emit("user:authenticated", { success: true });

      const messages = await Message.find({ room: "global", receiver: null })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("sender", "username avatar")
        .lean();
      socket.emit("messages:history", messages.reverse());

      console.log(`✅ Authenticated: ${username}`);
    } catch (err) {
      console.error("Auth error:", err);
      socket.emit("error", { message: "Authentication failed" });
    }
  });

  // 2. GLOBAL MESSAGE
  socket.on("message:send", async ({ content, room = "global" }) => {
    try {
      if (!socket.userId || !content?.trim() || content.length > 1000) return;

      const message = await Message.create({
        sender: socket.userId,
        receiver: null,
        content: content.trim(),
        room,
        type: "text",
      });

      const populated = await Message.findById(message._id)
        .populate("sender", "username avatar")
        .lean();

      io.to(room).emit("message:received", populated);
    } catch (err) {
      console.error("Message error:", err);
    }
  });

  // 3. DIRECT MESSAGE
  socket.on("dm:send", async ({ receiverId, content }) => {
    try {
      if (!socket.userId || !content?.trim() || content.length > 1000) return;

      const message = await Message.create({
        sender: socket.userId,
        receiver: receiverId,
        content: content.trim(),
        type: "text",
        room: "dm",
      });

      const populated = await Message.findById(message._id)
        .populate("sender", "username avatar")
        .populate("receiver", "username avatar")
        .lean();

      socket.emit("dm:received", populated);
      io.to(`user:${receiverId}`).emit("dm:received", populated);

      console.log(`💬 DM: ${socket.username} → ${receiverId}`);
    } catch (err) {
      console.error("DM error:", err);
    }
  });

  // 4. DM HISTORY
  socket.on("dm:history", async ({ withUserId }) => {
    try {
      if (!socket.userId) return;

      const messages = await Message.find({
        $or: [
          { sender: socket.userId, receiver: withUserId },
          { sender: withUserId, receiver: socket.userId },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("sender", "username avatar")
        .populate("receiver", "username avatar")
        .lean();

      socket.emit("dm:history", { withUserId, messages: messages.reverse() });
    } catch (err) {
      console.error("DM history error:", err);
    }
  });

  // 5. DM TYPING
  socket.on("dm:typing", ({ receiverId }) => {
    io.to(`user:${receiverId}`).emit("dm:user-typing", {
      userId: socket.userId,
      username: socket.username,
    });
  });

  socket.on("dm:stop-typing", ({ receiverId }) => {
    io.to(`user:${receiverId}`).emit("dm:user-stopped-typing", {
      userId: socket.userId,
    });
  });

  // 6. GLOBAL TYPING
  socket.on("chat:typing", ({ room = "global" }) => {
    socket.to(room).emit("chat:user-typing", {
      userId: socket.userId,
      username: socket.username,
    });
  });

  socket.on("chat:stop-typing", ({ room = "global" }) => {
    socket.to(room).emit("chat:user-stopped-typing", { userId: socket.userId });
  });

  // 7. GAME INVITE
  socket.on("game:invite", ({ targetUserId, gameId, gameName }) => {
    const targetEntry = Array.from(onlineUsers.entries()).find(
      ([, d]) => d.userId === targetUserId,
    );
    if (!targetEntry) {
      socket.emit("game:invite-failed", { reason: "User is offline" });
      return;
    }
    const senderData = onlineUsers.get(socket.id);
    io.to(targetEntry[0]).emit("game:invite-received", {
      from: {
        userId: socket.userId,
        username: senderData?.username,
        avatar: senderData?.avatar,
      },
      gameId,
      gameName,
      inviteId: `${socket.id}-${Date.now()}`,
    });
  });

  socket.on("game:invite-response", ({ accepted, gameId, inviterUserId }) => {
    const inviterEntry = Array.from(onlineUsers.entries()).find(
      ([, d]) => d.userId === inviterUserId,
    );
    if (!inviterEntry) return;
    const responderData = onlineUsers.get(socket.id);

    if (accepted) {
      const gameRoom = `game:${gameId}:${Date.now()}`;
      socket.join(gameRoom);
      io.sockets.sockets.get(inviterEntry[0])?.join(gameRoom);
      io.to(gameRoom).emit("game:started", {
        gameRoom,
        gameId,
        players: [
          {
            userId: inviterUserId,
            username: onlineUsers.get(inviterEntry[0])?.username,
          },
          { userId: socket.userId, username: responderData?.username },
        ],
      });
      console.log(`🎮 Game started: ${gameId} in room ${gameRoom}`);
    } else {
      io.to(inviterEntry[0]).emit("game:invite-declined", {
        by: responderData?.username,
        gameId,
      });
    }
  });

  // ── 8. TTT (Tic Tac Toe) MULTIPLAYER ─────────────────────────────────────

  // O'yinchi game room ga qo'shiladi
  socket.on("ttt:join", ({ gameRoom }) => {
    socket.join(gameRoom);

    // Roomda 2 ta odam bo'lsa — ikkalasiga ham ready signal yuborish
    const room = io.sockets.adapter.rooms.get(gameRoom);
    if (room && room.size >= 2) {
      io.to(gameRoom).emit("ttt:ready");
      console.log(`✅ TTT room ready: ${gameRoom} (${room.size} players)`);
    }

    console.log(`🎮 ${socket.username} joined TTT room: ${gameRoom}`);
  });

  // Qadamni boshqa o'yinchiga yuborish
  socket.on("ttt:move", ({ gameRoom, index, symbol, board }) => {
    // Faqat boshqa o'yinchiga yuborish (socket.to = o'zidan tashqari)
    socket.to(gameRoom).emit("ttt:move", { index, symbol, board });
    console.log(`♟️ TTT move: ${symbol} at ${index} in ${gameRoom}`);
  });

  // Reset — ikkalasiga ham yuborish
  socket.on("ttt:reset", ({ gameRoom }) => {
    socket.to(gameRoom).emit("ttt:reset");
  });

  // ── 9. DISCONNECT ─────────────────────────────────────────────────────────
  socket.on("disconnect", async () => {
    // O'yinchi game room dan chiqsa — raqibga xabar berish
    socket.rooms.forEach((room) => {
      if (room.startsWith("game:")) {
        socket.to(room).emit("ttt:opponent-left");
        console.log(`👋 ${socket.username} left game room: ${room}`);
      }
    });

    const userData = onlineUsers.get(socket.id);
    if (userData) {
      await User.findByIdAndUpdate(userData.userId, {
        isOnline: false,
        socketId: null,
        lastSeen: new Date(),
      });
      onlineUsers.delete(socket.id);
      io.emit("users:online-list", Array.from(onlineUsers.values()));
      console.log(`❌ Disconnected: ${userData.username}`);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Socket server on port ${PORT}`);
});
