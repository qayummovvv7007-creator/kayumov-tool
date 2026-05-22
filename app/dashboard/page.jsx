// app/(dashboard)/page.jsx — Dashboard bosh sahifasi

"use client";

import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import Link from "next/link";
import { MessageSquare, Gamepad2, Settings, Users } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { onlineUsers, isConnected } = useSocket();

  const apps = [
    {
      href: "/chat",
      icon: MessageSquare,
      label: "Global Chat",
      desc: `${onlineUsers.length} online`,
      color: "#3b82f6",
    },
    {
      href: "/games",
      icon: Gamepad2,
      label: "Game Lobby",
      desc: "Play with friends",
      color: "#8b5cf6",
    },
    {
      href: "/settings",
      icon: Settings,
      label: "Settings",
      desc: "Theme & Profile",
      color: "#22c55e",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Xush kelibsiz header */}
      <div className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-mono font-bold">
          Welcome back,{" "}
          <span style={{ color: "var(--accent-color)" }}>{user?.username}</span>
        </h1>
        <p className="text-slate-400 font-mono mt-2 flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-slate-500"}`}
          />
          {isConnected
            ? `Connected — ${onlineUsers.length} users online`
            : "Connecting..."}
        </p>
      </div>

      {/* App ikonlari */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {apps.map(({ href, icon: Icon, label, desc, color }) => (
          <Link key={href} href={href}>
            <div className="glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-200 cursor-pointer group border border-slate-700/50 hover:border-[var(--accent-color)]/30">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{
                  backgroundColor: `${color}20`,
                  border: `1px solid ${color}40`,
                }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <h3 className="font-mono font-semibold text-white">{label}</h3>
              <p className="text-sm text-slate-400 font-mono mt-1">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
