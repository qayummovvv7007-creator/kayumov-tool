// components/os/Taskbar.jsx
// Windows taskbar'iga o'xshash — pastda joylashgan navigatsiya

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  Monitor,
  MessageSquare,
  Gamepad2,
  Settings,
  LogOut,
  Wifi,
  WifiOff,
  Clock,
  User,
} from "lucide-react";

export default function Taskbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isConnected, onlineUsers } = useSocket();
  const [time, setTime] = useState(new Date());

  // Real-time soat
  useState(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  });

  const navItems = [
    { href: "/", icon: Monitor, label: "Desktop" },
    { href: "/chat", icon: MessageSquare, label: "Chat" },
    { href: "/games", icon: Gamepad2, label: "Games" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glass morphism taskbar */}
      <div className="glass border-t border-slate-700/50 px-4 py-2">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          {/* Chap: Foydalanuvchi avatari va username */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`
                }
                alt={user?.username}
                className="w-8 h-8 rounded-full border-2 border-[var(--accent-color)]"
              />
              {/* Online indikator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--bg-primary)] animate-pulse-dot" />
            </div>
            <span className="text-sm font-mono text-slate-300 hidden sm:block">
              {user?.username}
            </span>
          </div>

          {/* O'rta: Navigatsiya ikonlari */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              return (
                <Link key={href} href={href}>
                  <button
                    className={`
                      relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg
                      transition-all duration-200 group
                      ${
                        isActive
                          ? "bg-[var(--accent-color)]/20 text-[var(--accent-color)]"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }
                    `}
                    title={label}
                  >
                    <Icon size={18} />
                    <span className="text-[10px] font-mono">{label}</span>
                    {/* Aktiv indikator chiziq */}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--accent-color)] rounded-full" />
                    )}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* O'ng: Status va logout */}
          <div className="flex items-center gap-3">
            {/* Online foydalanuvchilar soni */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <User size={12} />
              <span>{onlineUsers.length} online</span>
            </div>

            {/* WebSocket holati */}
            <div
              className="flex items-center gap-1.5"
              title={isConnected ? "Connected" : "Disconnected"}
            >
              {isConnected ? (
                <Wifi size={14} className="text-green-500" />
              ) : (
                <WifiOff size={14} className="text-red-500" />
              )}
            </div>

            {/* Soat */}
            <span className="text-xs font-mono text-slate-400 hidden sm:block">
              {time.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
