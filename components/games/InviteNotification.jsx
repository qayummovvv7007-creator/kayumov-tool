"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";

export default function InviteNotification() {
  const { socket } = useSocket();
  const [invite, setInvite] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const handleInvite = (data) => {
      setInvite(data);
      setCountdown(30);
      setAccepting(false);
    };
    socket.on("game:invite-received", handleInvite);
    return () => socket.off("game:invite-received", handleInvite);
  }, [socket]);

  useEffect(() => {
    if (!invite) return;
    if (countdown <= 0) {
      handleDecline();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [invite, countdown]);

  const handleAccept = () => {
    if (!socket || !invite) return;
    setAccepting(true);
    socket.emit("game:invite-response", {
      inviteId: invite.inviteId,
      accepted: true,
      gameId: invite.gameId,
      inviterUserId: invite.from.userId,
    });
    setTimeout(() => setInvite(null), 1000);
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

  const progress = (countdown / 30) * 100;
  const avatarSrc =
    invite.from.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${invite.from.username}`;

  return (
    <>
      <style>{`
        @keyframes inviteOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes inviteCardIn {
          0%   { opacity:0; transform: scale(0.5) translateY(60px) rotate(-8deg); }
          60%  { transform: scale(1.06) translateY(-8px) rotate(1deg); }
          80%  { transform: scale(0.97) translateY(3px) rotate(0deg); }
          100% { opacity:1; transform: scale(1) translateY(0) rotate(0deg); }
        }
        @keyframes avatarFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%     { transform: translateY(-6px) scale(1.04); }
        }
        @keyframes ringPulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes particle {
          0%   { transform: translate(0,0) scale(1); opacity:1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity:0; }
        }
        @keyframes acceptBurst {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.15); }
          100% { transform: scale(0); opacity:0; }
        }
        @keyframes gameIconSpin {
          from { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.2); }
          to   { transform: rotate(360deg) scale(1); }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 20px #38bdf840, 0 0 60px #38bdf820; }
          50%     { box-shadow: 0 0 40px #38bdf870, 0 0 100px #38bdf840; }
        }
        @keyframes textShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes countdownUrgent {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.15); }
        }
        .invite-card {
          animation: inviteCardIn .7s cubic-bezier(0.16,1,0.3,1) both;
        }
        .avatar-float {
          animation: avatarFloat 2.5s ease-in-out infinite;
        }
        .glow-card {
          animation: glowPulse 2s ease-in-out infinite;
        }
        .accept-btn {
          transition: all .2s;
          position: relative;
          overflow: hidden;
        }
        .accept-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        }
        .accept-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 24px rgba(34,197,94,0.5);
        }
        .decline-btn {
          transition: all .2s;
        }
        .decline-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 24px rgba(239,68,68,0.4);
        }
      `}</style>

      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
          animation: "inviteOverlayIn .3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: [
                "#38bdf8",
                "#a78bfa",
                "#34d399",
                "#f97316",
                "#ef4444",
              ][i % 5],
              top: "50%",
              left: "50%",
              "--tx": `${Math.cos((i * 30 * Math.PI) / 180) * (80 + Math.random() * 60)}px`,
              "--ty": `${Math.sin((i * 30 * Math.PI) / 180) * (80 + Math.random() * 60)}px`,
              animation: `particle 1.2s ${i * 0.05}s ease-out both`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Main Card */}
        <div
          className={`invite-card glow-card ${accepting ? "" : ""}`}
          style={{
            background:
              "linear-gradient(135deg, rgba(8,14,26,0.98) 0%, rgba(15,25,48,0.98) 100%)",
            border: "1px solid rgba(56,189,248,0.3)",
            borderRadius: 28,
            padding: "36px 32px",
            width: 360,
            maxWidth: "90vw",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.04,
              backgroundImage:
                "linear-gradient(rgba(56,189,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,1) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              pointerEvents: "none",
            }}
          />

          {/* Top accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: 2,
              background:
                "linear-gradient(to right, transparent, #38bdf8, #a78bfa, transparent)",
              borderRadius: 99,
            }}
          />

          {/* Game icon — spinning */}
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 36,
              height: 36,
              background: "rgba(56,189,248,0.1)",
              border: "1px solid rgba(56,189,248,0.2)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              animation: "gameIconSpin 3s linear infinite",
            }}
          >
            🎮
          </div>

          {/* Avatar section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            {/* Pulse rings */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    inset: -i * 10,
                    borderRadius: "50%",
                    border: "2px solid rgba(56,189,248,0.3)",
                    animation: `ringPulse 2s ${i * 0.4}s ease-out infinite`,
                  }}
                />
              ))}

              <div className="avatar-float">
                <img
                  src={avatarSrc}
                  alt={invite.from.username}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    border: "3px solid #38bdf8",
                    boxShadow: "0 0 30px rgba(56,189,248,0.6)",
                    display: "block",
                  }}
                />
              </div>
            </div>

            {/* Username */}
            <h2
              style={{
                fontFamily: "monospace",
                fontWeight: 800,
                fontSize: 20,
                background: "linear-gradient(135deg, #38bdf8, #a78bfa)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: "0 0 4px",
              }}
            >
              {invite.from.username}
            </h2>

            <p
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "rgba(148,163,184,0.7)",
                margin: 0,
                letterSpacing: ".1em",
              }}
            >
              CHALLENGES YOU TO
            </p>
          </div>

          {/* Game name */}
          <div
            style={{
              background: "rgba(56,189,248,0.08)",
              border: "1px solid rgba(56,189,248,0.2)",
              borderRadius: 14,
              padding: "14px 20px",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 6 }}>
              {invite.gameId === "tic-tac-toe"
                ? "⭕"
                : invite.gameId === "memory-cards"
                  ? "🃏"
                  : invite.gameId === "snake"
                    ? "🐍"
                    : "🎮"}
            </div>
            <p
              style={{
                fontFamily: "monospace",
                fontWeight: 800,
                fontSize: 18,
                color: "#f1f5f9",
                margin: "0 0 2px",
              }}
            >
              {invite.gameName}
            </p>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "rgba(56,189,248,0.6)",
                margin: 0,
                letterSpacing: ".08em",
              }}
            >
              MULTIPLAYER BATTLE
            </p>
          </div>

          {/* Countdown */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "monospace",
                fontSize: 10,
                color: "rgba(148,163,184,0.5)",
                marginBottom: 6,
                letterSpacing: ".06em",
              }}
            >
              <span>TIME REMAINING</span>
              <span
                style={{
                  color: countdown <= 10 ? "#ef4444" : "#38bdf8",
                  fontWeight: 700,
                  fontSize: 12,
                  animation:
                    countdown <= 10 ? "countdownUrgent .5s infinite" : "none",
                  display: "inline-block",
                }}
              >
                {countdown}s
              </span>
            </div>
            {/* Progress bar */}
            <div
              style={{
                height: 4,
                background: "rgba(148,163,184,0.1)",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background:
                    countdown <= 10
                      ? "linear-gradient(to right, #ef4444, #f97316)"
                      : "linear-gradient(to right, #38bdf8, #a78bfa)",
                  borderRadius: 99,
                  transition: "width 1s linear, background .5s",
                }}
              />
            </div>
          </div>

          {/* Buttons */}
          {accepting ? (
            <div
              style={{
                textAlign: "center",
                padding: "16px 0",
                fontFamily: "monospace",
                fontSize: 16,
                color: "#22c55e",
                fontWeight: 700,
                letterSpacing: ".1em",
              }}
            >
              ✓ JOINING GAME...
            </div>
          ) : (
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="accept-btn"
                onClick={handleAccept}
                style={{
                  flex: 1,
                  padding: "13px",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  border: "none",
                  borderRadius: 14,
                  fontFamily: "monospace",
                  fontSize: 13,
                  fontWeight: 800,
                  color: "white",
                  cursor: "pointer",
                  letterSpacing: ".08em",
                }}
              >
                ✓ ACCEPT
              </button>
              <button
                className="decline-btn"
                onClick={handleDecline}
                style={{
                  flex: 1,
                  padding: "13px",
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 14,
                  fontFamily: "monospace",
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#ef4444",
                  cursor: "pointer",
                  letterSpacing: ".08em",
                }}
              >
                ✕ DECLINE
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
