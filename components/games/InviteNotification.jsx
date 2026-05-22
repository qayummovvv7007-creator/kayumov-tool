// components/games/InviteNotification.jsx
// Real-time o'yin taklifi popup — global overlay

"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { Gamepad2, X, Check } from "lucide-react";

export default function InviteNotification() {
  const { socket } = useSocket();
  const [invite, setInvite] = useState(null);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!socket) return;

    // O'yin taklifi keldi
    const handleInviteReceived = (inviteData) => {
      setInvite(inviteData);
      setCountdown(30); // 30 soniya timeout
    };

    socket.on("game:invite-received", handleInviteReceived);
    return () => socket.off("game:invite-received", handleInviteReceived);
  }, [socket]);

  // Countdown timer
  useEffect(() => {
    if (!invite) return;
    if (countdown <= 0) {
      handleDecline();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [invite, countdown]);

  const handleAccept = () => {
    if (!socket || !invite) return;
    socket.emit("game:invite-response", {
      inviteId: invite.inviteId,
      accepted: true,
      gameId: invite.gameId,
      inviterUserId: invite.from.userId,
    });
    setInvite(null);
    // TODO: O'yin sahifasiga yo'naltirish
  };

  const handleDecline = () => {
    if (!socket || !invite) return;
    socket.emit("game:invite-response", {
      inviteId: invite.inviteId,
      accepted: false,
      gameId: invite.gameId,
      inviterUserId: invite.from.userId,
    });
    setInvite(null);
  };

  if (!invite) return null;

  return (
    // Global overlay — hamma sahifalarda ko'rinadi
    <div className="fixed top-4 right-4 z-[100] animate-slide-in">
      <div className="glass border border-[var(--accent-color)]/30 rounded-xl p-4 w-80 shadow-2xl">
        {/* Sarlavha */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[var(--accent-color)]/20 rounded-lg flex items-center justify-center">
            <Gamepad2 size={16} className="text-[var(--accent-color)]" />
          </div>
          <div>
            <p className="text-sm font-mono font-semibold">Game Invite!</p>
            <p className="text-xs text-slate-400 font-mono">
              Expires in {countdown}s
            </p>
          </div>
          {/* Countdown progress bar */}
          <div className="ml-auto w-8 h-8 relative">
            <svg className="w-8 h-8 -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke="rgba(148,163,184,0.1)"
                strokeWidth="2"
              />
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke="var(--accent-color)"
                strokeWidth="2"
                strokeDasharray={`${(countdown / 30) * 75.4} 75.4`}
                className="transition-all duration-1000"
              />
            </svg>
          </div>
        </div>

        {/* Kimdan, qaysi o'yin */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-slate-800/50 rounded-lg">
          <img
            src={
              invite.from.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${invite.from.username}`
            }
            className="w-8 h-8 rounded-full border border-slate-700"
            alt={invite.from.username}
          />
          <div>
            <p className="text-sm font-mono">
              <span className="text-[var(--accent-color)]">
                {invite.from.username}
              </span>
              <span className="text-slate-400"> wants to play</span>
            </p>
            <p className="text-xs font-mono font-bold mt-0.5">
              {invite.gameName}
            </p>
          </div>
        </div>

        {/* Qabul/Rad etish tugmalari */}
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500/20 border border-green-500/40 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-mono transition-all"
          >
            <Check size={14} /> Accept
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-mono transition-all"
          >
            <X size={14} /> Decline
          </button>
        </div>
      </div>
    </div>
  );
}
