// components/games/GameLobby.jsx
// Steam-ga o'xshash o'yin lobbisi

"use client";

import { useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import GameCard from "./GameCard";
import { Users, Gamepad2 } from "lucide-react";

// O'yinlar katalogi
const GAMES = [
  {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    description: "Classic 3x3 grid game",
    players: "2 players",
    icon: "⭕",
    color: "#3b82f6",
    status: "available",
  },
  {
    id: "memory-cards",
    name: "Memory Cards",
    description: "Find matching pairs",
    players: "1-2 players",
    icon: "🃏",
    color: "#8b5cf6",
    status: "available",
  },
  {
    id: "snake",
    name: "Snake",
    description: "Classic snake game",
    players: "1 player",
    icon: "🐍",
    color: "#22c55e",
    status: "available",
  },
  {
    id: "pong",
    name: "Pong",
    description: "Retro ping-pong battle",
    players: "2 players",
    icon: "🏓",
    color: "#f97316",
    status: "coming-soon",
  },
];

export default function GameLobby() {
  const { socket, onlineUsers } = useSocket();
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState(null);
  const [sentInvites, setSentInvites] = useState(new Set());

  // O'yinni tanlaganda invite panel ko'rsatish
  const handleGameSelect = (game) => {
    if (game.status === "coming-soon") return;
    setSelectedGame(selectedGame?.id === game.id ? null : game);
  };

  // Foydalanuvchiga o'yin taklifi yuborish
  const handleSendInvite = (targetUserId, targetUsername) => {
    if (!socket || !selectedGame) return;

    socket.emit("game:invite", {
      targetUserId,
      gameId: selectedGame.id,
      gameName: selectedGame.name,
    });

    // Yuborilgan takliflarni kuzatish (UI uchun)
    setSentInvites((prev) => new Set([...prev, targetUserId]));

    // 10 soniyadan keyin holat tozalanadi
    setTimeout(() => {
      setSentInvites((prev) => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    }, 10000);
  };

  // O'zimizdan boshqa online foydalanuvchilar
  const otherOnlineUsers = onlineUsers.filter((u) => u.userId !== user?.id);

  return (
    <div className="flex gap-6 h-full">
      {/* ===== O'YINLAR KATALOGI ===== */}
      <div className="flex-1">
        <div className="mb-6">
          <h2 className="text-xl font-mono font-bold flex items-center gap-2">
            <Gamepad2 size={20} className="text-[var(--accent-color)]" />
            Game Library
          </h2>
          <p className="text-sm text-slate-400 font-mono mt-1">
            Select a game and invite online players
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isSelected={selectedGame?.id === game.id}
              onSelect={() => handleGameSelect(game)}
            />
          ))}
        </div>

        {/* Tanlangan o'yin uchun invite panel */}
        {selectedGame && (
          <div className="mt-6 glass rounded-xl p-5 animate-fade-in border border-[var(--accent-color)]/20">
            <h3 className="font-mono font-semibold mb-3 text-[var(--accent-color)]">
              Invite to {selectedGame.name}
            </h3>

            {otherOnlineUsers.length === 0 ? (
              <p className="text-sm text-slate-500 font-mono">
                No other players online. Share the link and invite friends!
              </p>
            ) : (
              <div className="space-y-2">
                {otherOnlineUsers.map((onlineUser) => (
                  <div
                    key={onlineUser.userId}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={
                            onlineUser.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${onlineUser.username}`
                          }
                          className="w-8 h-8 rounded-full border border-slate-700"
                          alt={onlineUser.username}
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-800" />
                      </div>
                      <span className="text-sm font-mono">
                        {onlineUser.username}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        handleSendInvite(onlineUser.userId, onlineUser.username)
                      }
                      disabled={sentInvites.has(onlineUser.userId)}
                      className="
                        px-3 py-1.5 text-xs font-mono rounded-lg transition-all
                        bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/40
                        hover:bg-[var(--accent-color)]/40 text-[var(--accent-color)]
                        disabled:opacity-50 disabled:cursor-not-allowed
                      "
                    >
                      {sentInvites.has(onlineUser.userId)
                        ? "✓ Invite Sent"
                        : "Send Invite →"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== ONLINE O'YINCHILAR PANEL (Steam sidebar) ===== */}
      <div className="w-64 flex-shrink-0 glass rounded-xl p-4 h-fit">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-[var(--accent-color)]" />
          <h3 className="text-sm font-mono font-semibold">
            Players Online ({onlineUsers.length})
          </h3>
        </div>

        <div className="space-y-2">
          {onlineUsers.map((onlineUser) => (
            <div
              key={onlineUser.userId}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="relative">
                <img
                  src={
                    onlineUser.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${onlineUser.username}`
                  }
                  className="w-8 h-8 rounded-full"
                  alt={onlineUser.username}
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[var(--bg-primary)]" />
              </div>
              <div>
                <p
                  className={`text-sm font-mono leading-none ${onlineUser.userId === user?.id ? "text-[var(--accent-color)]" : "text-white"}`}
                >
                  {onlineUser.username}
                </p>
                <p className="text-[10px] text-green-400 font-mono mt-0.5">
                  ● Online
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
