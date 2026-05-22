// components/chat/ChatWindow.jsx
// Asosiy chat interfeysi — real-time xabar yuborish va qabul qilish

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { Send, Hash, Users } from "lucide-react";
import MessageBubble from "./MessageBubble";
import OnlineUsersList from "./OnlineUsersList";

export default function ChatWindow() {
  const { socket, onlineUsers } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showOnlineList, setShowOnlineList] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Sahifa yuklanganda oxirgi xabarlarni olish
  useEffect(() => {
    fetchMessages();
  }, []);

  // Socket hodisalarini tinglash
  useEffect(() => {
    if (!socket) return;

    // Yangi xabar keldi
    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    // Chat tarixi yuborildi (birinchi ulanishda)
    const handleHistory = (history) => {
      setMessages(history);
      setIsLoading(false);
    };

    // Foydalanuvchi yozmoqda
    const handleTyping = ({ userId, username }) => {
      if (userId === user?.id) return;
      setTypingUsers((prev) => {
        if (prev.find((u) => u.userId === userId)) return prev;
        return [...prev, { userId, username }];
      });
    };

    // Yozish to'xtadi
    const handleStopTyping = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    socket.on("message:received", handleNewMessage);
    socket.on("messages:history", handleHistory);
    socket.on("chat:user-typing", handleTyping);
    socket.on("chat:user-stopped-typing", handleStopTyping);

    return () => {
      socket.off("message:received", handleNewMessage);
      socket.off("messages:history", handleHistory);
      socket.off("chat:user-typing", handleTyping);
      socket.off("chat:user-stopped-typing", handleStopTyping);
    };
  }, [socket, user?.id]);

  // Yangi xabar kelganda pastga scroll qilish
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages?room=global&limit=50");
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket) return;

    socket.emit("message:send", {
      content: inputValue.trim(),
      room: "global",
    });

    setInputValue("");

    // Yozish to'xtatildi
    socket.emit("chat:stop-typing", { room: "global" });
    clearTimeout(typingTimeoutRef.current);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    // Yozish indikatorini yuborish
    if (socket) {
      socket.emit("chat:typing", { room: "global" });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("chat:stop-typing", { room: "global" });
      }, 2000); // 2 soniyadan keyin to'xtadi deb hisoblanadi
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ===== ASOSIY CHAT MAYDONI ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat sarlavhasi */}
        <div className="glass border-b border-slate-700/50 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash size={18} className="text-[var(--accent-color)]" />
            <span className="font-mono font-semibold">global</span>
            <span className="text-xs text-slate-500 font-mono">
              — Global Chat Room
            </span>
          </div>
          <button
            onClick={() => setShowOnlineList(!showOnlineList)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Users size={14} />
            <span>{onlineUsers.length}</span>
          </button>
        </div>

        {/* Xabarlar ro'yxati */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-sm">
              <Hash size={32} className="mx-auto mb-3 opacity-30" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={message._id || index}
                message={message}
                isOwn={
                  message.sender?._id === user?.id ||
                  message.sender === user?.id
                }
              />
            ))
          )}

          {/* Yozish indikatori */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono animate-fade-in">
              <div className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span>
                {typingUsers.map((u) => u.username).join(", ")} is typing...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Xabar yuborish formi */}
        <div className="glass border-t border-slate-700/50 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Message #global..."
              maxLength={1000}
              className="
                flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg
                px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500
                focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)]/30
                transition-all duration-200
              "
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="
                px-4 py-2.5 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/80
                text-white rounded-lg transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center gap-2
              "
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* ===== ONLINE FOYDALANUVCHILAR PANEL ===== */}
      {showOnlineList && (
        <div className="w-56 border-l border-slate-700/50 flex-shrink-0">
          <OnlineUsersList />
        </div>
      )}
    </div>
  );
}
