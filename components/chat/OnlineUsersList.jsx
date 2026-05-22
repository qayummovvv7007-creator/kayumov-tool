// components/chat/OnlineUsersList.jsx
// Online foydalanuvchilar ro'yxati — real-time yangilanadi

"use client";

import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

export default function OnlineUsersList() {
  const { onlineUsers } = useSocket();
  const { user } = useAuth();

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          Online — {onlineUsers.length}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {onlineUsers.map((onlineUser) => (
          <div
            key={onlineUser.userId}
            className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/5 transition-colors rounded-lg mx-1"
          >
            {/* Avatar + online dot */}
            <div className="relative flex-shrink-0">
              <img
                src={
                  onlineUser.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${onlineUser.username}`
                }
                alt={onlineUser.username}
                className="w-7 h-7 rounded-full border border-slate-700"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[var(--bg-primary)] animate-pulse-dot" />
            </div>

            {/* Username */}
            <span
              className={`text-sm font-mono truncate ${onlineUser.userId === user?.id ? "text-[var(--accent-color)]" : "text-slate-300"}`}
            >
              {onlineUser.username}
              {onlineUser.userId === user?.id && " (you)"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
