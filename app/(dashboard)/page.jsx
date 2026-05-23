"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useEffect, useState, useRef } from "react";

// ── Animated SVG Icons ──────────────────────────────────────────────────────

function ChatIcon({ color }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <style>{`
        @keyframes blink1 { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes blink2 { 0%,100%{opacity:1} 33%{opacity:.2} }
        @keyframes blink3 { 0%,100%{opacity:1} 66%{opacity:.2} }
        @keyframes bubbleIn { 0%{transform:scale(.85) translateY(3px);opacity:0} 100%{transform:scale(1) translateY(0);opacity:1} }
      `}</style>
      <rect
        x="2"
        y="4"
        width="24"
        height="18"
        rx="5"
        fill={color}
        opacity=".15"
        stroke={color}
        strokeWidth="1.5"
        style={{ animation: "bubbleIn .5s ease both" }}
      />
      <circle
        cx="10"
        cy="13"
        r="1.8"
        fill={color}
        style={{ animation: "blink1 1.4s infinite" }}
      />
      <circle
        cx="14"
        cy="13"
        r="1.8"
        fill={color}
        style={{ animation: "blink2 1.4s infinite" }}
      />
      <circle
        cx="18"
        cy="13"
        r="1.8"
        fill={color}
        style={{ animation: "blink3 1.4s infinite" }}
      />
      <rect
        x="10"
        y="18"
        width="18"
        height="14"
        rx="4"
        fill={color}
        opacity=".1"
        stroke={color}
        strokeWidth="1.5"
        style={{
          animation: "bubbleIn .5s .15s ease both",
          opacity: 0,
          animationFillMode: "both",
        }}
      />
      <line
        x1="10"
        y1="25"
        x2="22"
        y2="25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity=".7"
      />
      <line
        x1="10"
        y1="28"
        x2="18"
        y2="28"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity=".5"
      />
    </svg>
  );
}

function GameIcon({ color }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <style>{`
        @keyframes drift { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes btnPulse { 0%,100%{opacity:.4} 50%{opacity:1} }
      `}</style>
      <rect
        x="4"
        y="10"
        width="28"
        height="18"
        rx="9"
        fill={color}
        opacity=".12"
        stroke={color}
        strokeWidth="1.5"
        style={{ animation: "drift 2.5s ease-in-out infinite" }}
      />
      <line
        x1="14"
        y1="16"
        x2="14"
        y2="22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".9"
      />
      <line
        x1="11"
        y1="19"
        x2="17"
        y2="19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".9"
      />
      <circle
        cx="24"
        cy="17"
        r="2"
        fill={color}
        style={{ animation: "btnPulse 1.2s infinite" }}
      />
      <circle
        cx="27"
        cy="20"
        r="2"
        fill={color}
        style={{ animation: "btnPulse 1.2s .4s infinite" }}
      />
      <circle
        cx="21"
        cy="20"
        r="2"
        fill={color}
        style={{ animation: "btnPulse 1.2s .8s infinite" }}
      />
      <rect
        x="15"
        y="7"
        width="6"
        height="5"
        rx="1.5"
        fill={color}
        opacity=".3"
      />
    </svg>
  );
}

function SettingsIcon({ color }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <style>{`
        @keyframes spin1 { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes spin2 { from{transform:rotate(360deg)} to{transform:rotate(0deg)} }
      `}</style>
      <g
        style={{
          transformOrigin: "18px 18px",
          animation: "spin1 6s linear infinite",
        }}
      >
        <circle
          cx="18"
          cy="18"
          r="10"
          stroke={color}
          strokeWidth="1.5"
          opacity=".2"
          fill="none"
        />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <rect
            key={i}
            x="16.5"
            y="6"
            width="3"
            height="4"
            rx="1.5"
            fill={color}
            style={{
              transformOrigin: "18px 18px",
              transform: `rotate(${deg}deg)`,
              opacity: i % 2 === 0 ? 0.9 : 0.4,
            }}
          />
        ))}
      </g>
      <g
        style={{
          transformOrigin: "18px 18px",
          animation: "spin2 4s linear infinite",
        }}
      >
        <circle
          cx="18"
          cy="18"
          r="6"
          stroke={color}
          strokeWidth="1.5"
          opacity=".3"
          fill="none"
        />
      </g>
      <circle cx="18" cy="18" r="3" fill={color} opacity=".9" />
    </svg>
  );
}

// ── Tilt Card ───────────────────────────────────────────────────────────────

function TiltCard({ href, icon, label, desc, color, index }) {
  const cardRef = useRef(null);

  const handleMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateX(${-y * 14}deg) rotateY(${x * 14}deg) scale(1.03)`;
    card.style.boxShadow = `${-x * 20}px ${-y * 20}px 40px ${color}22, 0 0 30px ${color}15`;
  };

  const handleLeave = (e) => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(600px) rotateX(0) rotateY(0) scale(1)";
    card.style.boxShadow = `0 0 0px ${color}00`;
  };

  return (
    <Link href={href}>
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{
          background: "rgba(15,23,42,0.75)",
          backdropFilter: "blur(16px)",
          border: `1px solid ${color}30`,
          borderRadius: "20px",
          padding: "28px 24px",
          cursor: "pointer",
          transition: "transform .15s ease, box-shadow .15s ease",
          animation: `cardEnter .6s ${index * 0.1 + 0.2}s both ease`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Corner glow */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Icon container */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: `${color}12`,
            border: `1px solid ${color}35`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            boxShadow: `inset 0 0 20px ${color}10`,
          }}
        >
          {icon}
        </div>

        <h3
          style={{
            fontFamily: "monospace",
            fontWeight: 700,
            fontSize: 17,
            color: "#f1f5f9",
            margin: "0 0 6px",
            letterSpacing: ".02em",
          }}
        >
          {label}
        </h3>

        <p
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            color: color,
            margin: 0,
            opacity: 0.85,
          }}
        >
          {desc}
        </p>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "20%",
            right: "20%",
            height: 1,
            background: `linear-gradient(to right, transparent, ${color}60, transparent)`,
          }}
        />
      </div>
    </Link>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const { onlineUsers, isConnected } = useSocket();
  const [tick, setTick] = useState(0);

  // Typewriter for username
  const fullName = user?.username ?? "";
  const [typed, setTyped] = useState("");
  useEffect(() => {
    if (!fullName) return;
    setTyped("");
    let i = 0;
    const t = setInterval(() => {
      setTyped(fullName.slice(0, ++i));
      if (i >= fullName.length) clearInterval(t);
    }, 60);
    return () => clearInterval(t);
  }, [fullName]);

  // Blinking cursor
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 530);
    return () => clearInterval(t);
  }, []);

  const apps = [
    {
      href: "/chat",
      icon: <ChatIcon color="#38bdf8" />,
      label: "Global Chat",
      desc: `${onlineUsers.length} users online`,
      color: "#38bdf8",
    },
    {
      href: "/games",
      icon: <GameIcon color="#a78bfa" />,
      label: "Game Lobby",
      desc: "Play with friends",
      color: "#a78bfa",
    },
    {
      href: "/settings",
      icon: <SettingsIcon color="#34d399" />,
      label: "Settings",
      desc: "Theme & Profile",
      color: "#34d399",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes cardEnter {
          from { opacity:0; transform:translateY(24px) scale(.97); }
          to   { opacity:1; transform:translateY(0)   scale(1);   }
        }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
        @keyframes gridScroll { from{background-position:0 0} to{background-position:0 40px} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes scanline { from{top:-10%} to{top:110%} }
      `}</style>

      {/* Animated grid background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `
          linear-gradient(rgba(56,189,248,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56,189,248,.04) 1px, transparent 1px)
        `,
          backgroundSize: "40px 40px",
          animation: "gridScroll 4s linear infinite",
        }}
      />

      {/* Scanline */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          height: "2px",
          background:
            "linear-gradient(to right, transparent, rgba(56,189,248,.12), transparent)",
          zIndex: 0,
          pointerEvents: "none",
          animation: "scanline 6s linear infinite",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 860,
          margin: "0 auto",
          padding: "52px 24px 40px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 48, animation: "fadeIn .5s ease both" }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              color: "#38bdf8",
              marginBottom: 10,
              letterSpacing: ".12em",
              opacity: 0.7,
            }}
          >
            // KAYUMOV-TOOL OS v1.0
          </div>

          <h1
            style={{
              fontFamily: "monospace",
              fontWeight: 800,
              fontSize: "clamp(26px, 4vw, 38px)",
              color: "#f1f5f9",
              margin: "0 0 12px",
              letterSpacing: "-.01em",
            }}
          >
            Welcome back,{" "}
            <span style={{ color: "var(--accent-color, #38bdf8)" }}>
              {typed}
            </span>
            <span
              style={{
                opacity: tick % 2 === 0 ? 1 : 0,
                color: "var(--accent-color, #38bdf8)",
              }}
            >
              _
            </span>
          </h1>

          {/* Status bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontFamily: "monospace",
              fontSize: 13,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: isConnected ? "#22c55e" : "#64748b",
                  display: "inline-block",
                  boxShadow: isConnected ? "0 0 8px #22c55e" : "none",
                  animation: isConnected ? "pulse 2s infinite" : "none",
                }}
              />
              <span style={{ color: isConnected ? "#86efac" : "#64748b" }}>
                {isConnected ? "CONNECTED" : "CONNECTING..."}
              </span>
            </span>
            <span style={{ color: "#475569" }}>|</span>
            <span style={{ color: "#94a3b8" }}>
              <span style={{ color: "#38bdf8" }}>{onlineUsers.length}</span>{" "}
              users online
            </span>
            {user?.avatar && (
              <>
                <span style={{ color: "#475569" }}>|</span>
                <img
                  src={user.avatar}
                  alt=""
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: "1.5px solid #38bdf840",
                  }}
                />
              </>
            )}
          </div>
        </div>

        {/* App Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {apps.map((app, i) => (
            <TiltCard key={app.href} {...app} index={i} />
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 48,
            fontFamily: "monospace",
            fontSize: 12,
            color: "#334155",
            textAlign: "center",
            animation: "fadeIn .6s .6s both ease",
          }}
        >
          KAYUMOV-TOOL © {new Date().getFullYear()} — All systems operational
        </div>
      </div>
    </>
  );
}
