"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";

function avatarUrl(u) {
  return (
    u?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${u?.username || "user"}`
  );
}

// ── Ding sound (Web Audio API) ─────────────────────────────────────────────
function playDing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.4);
  } catch {}
}

// ── Single notification ────────────────────────────────────────────────────
function Toast({ notif, onClose }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Enter animatsiya
    const t1 = setTimeout(() => setVisible(true), 10);
    // 5 soniyadan keyin chiqib ketadi
    const t2 = setTimeout(() => handleClose(), 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => onClose(notif.id), 350);
  };

  const handleClick = () => {
    router.push("/chat");
    handleClose();
  };

  const accent = "var(--accent-color, #38bdf8)";

  return (
    <div
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        background: "rgba(8,16,32,0.95)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${accent}30`,
        borderRadius: 16,
        cursor: "pointer",
        minWidth: 280,
        maxWidth: 340,
        boxShadow: `0 8px 32px rgba(0,0,0,.5), 0 0 0 1px ${accent}15`,
        transform:
          visible && !leaving
            ? "translateX(0) scale(1)"
            : leaving
              ? "translateX(120%) scale(0.95)"
              : "translateX(120%) scale(0.95)",
        opacity: visible && !leaving ? 1 : 0,
        transition: leaving
          ? "all .35s cubic-bezier(.4,0,1,1)"
          : "all .4s cubic-bezier(0,0,.2,1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 2,
          background: accent,
          animation: "toastProgress 5s linear forwards",
          opacity: 0.6,
        }}
      />

      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={avatarUrl({ avatar: notif.avatar, username: notif.sender })}
          alt={notif.sender}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `2px solid ${accent}50`,
            boxShadow: `0 0 12px ${accent}30`,
          }}
        />
        <span
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#22c55e",
            border: "2px solid #080f20",
            boxShadow: "0 0 6px #22c55e",
          }}
        />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              fontWeight: 700,
              color: "#f1f5f9",
              letterSpacing: ".02em",
            }}
          >
            {notif.sender}
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              color: "#334155",
              letterSpacing: ".06em",
            }}
          >
            NOW
          </span>
        </div>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: 12,
            color: "#64748b",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 180,
          }}
        >
          {notif.content}
        </p>
      </div>

      {/* Close btn */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#334155",
          padding: 4,
          borderRadius: 6,
          flexShrink: 0,
          transition: "color .15s",
          display: "flex",
          alignItems: "center",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 2l8 8M10 2L2 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

// ── Main Notification Provider ─────────────────────────────────────────────
export default function MessageNotification() {
  const { socket } = useSocket();
  const { user } = useAuth();
  const pathname = usePathname();
  const [toasts, setToasts] = useState([]);
  const myId = user?.id || user?._id;

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onDmReceived = (msg) => {
      const senderId = msg.sender?._id?.toString() || msg.sender?.toString();

      // O'z xabarimni ko'rsatma
      if (senderId === myId?.toString()) return;

      // Chat sahifasida ochiq bo'lsa — notification ko'rsatma
      if (pathname === "/chat") return;

      playDing();

      const newToast = {
        id: Date.now() + Math.random(),
        sender: msg.sender?.username || "Unknown",
        avatar: msg.sender?.avatar,
        content: msg.content,
      };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Max 5 ta
    };

    socket.on("dm:received", onDmReceived);
    return () => socket.off("dm:received", onDmReceived);
  }, [socket, myId, pathname]);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          bottom: 72,
          right: 16,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          alignItems: "flex-end",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: "all" }}>
            <Toast notif={t} onClose={removeToast} />
          </div>
        ))}
      </div>
    </>
  );
}
