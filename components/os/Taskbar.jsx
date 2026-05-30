"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

function IconDesktop({ active }) {
  const c = active ? "var(--accent-color, #38bdf8)" : "#94a3b8";
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="2"
        y="2"
        width="16"
        height="11"
        rx="2"
        stroke={c}
        strokeWidth="1.4"
        fill={active ? `${c}18` : "none"}
      />
      <line x1="10" y1="13" x2="10" y2="16" stroke={c} strokeWidth="1.4" />
      <line
        x1="6"
        y1="16"
        x2="14"
        y2="16"
        stroke={c}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {active && <circle cx="10" cy="7.5" r="1.5" fill={c} opacity=".8" />}
    </svg>
  );
}

function IconChat({ active, hasUnread }) {
  const c = active ? "var(--accent-color, #38bdf8)" : "#94a3b8";
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <style>{`.dot-a{animation:da 1.4s infinite}.dot-b{animation:db 1.4s infinite}.dot-c{animation:dc 1.4s infinite}@keyframes da{0%,100%{opacity:1}33%{opacity:.2}}@keyframes db{0%,100%{opacity:1}50%{opacity:.2}}@keyframes dc{0%,100%{opacity:1}66%{opacity:.2}}`}</style>
        <rect
          x="2"
          y="3"
          width="13"
          height="9"
          rx="3"
          stroke={c}
          strokeWidth="1.4"
          fill={active ? `${c}18` : "none"}
        />
        {active ? (
          <>
            <circle cx="6" cy="7.5" r="1" fill={c} className="dot-a" />
            <circle cx="8.5" cy="7.5" r="1" fill={c} className="dot-b" />
            <circle cx="11" cy="7.5" r="1" fill={c} className="dot-c" />
          </>
        ) : (
          <line
            x1="5.5"
            y1="7.5"
            x2="11"
            y2="7.5"
            stroke={c}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity=".6"
          />
        )}
        <rect
          x="6"
          y="10"
          width="12"
          height="8"
          rx="2.5"
          stroke={c}
          strokeWidth="1.4"
          fill={active ? `${c}12` : "none"}
        />
        <line
          x1="9"
          y1="14"
          x2="15"
          y2="14"
          stroke={c}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity=".5"
        />
      </svg>

      {/* ✅ Unread badge */}
      {hasUnread && (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#ef4444",
            border: "2px solid #070f1e",
            animation: "unreadPing 1.5s ease-in-out infinite",
          }}
        />
      )}
    </div>
  );
}

function IconGame({ active }) {
  const c = active ? "#a78bfa" : "#94a3b8";
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <style>{`.gf{animation:gf 2s ease-in-out infinite}@keyframes gf{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}.bp{animation:bp 1s infinite}.bq{animation:bp 1s .33s infinite}.br{animation:bp 1s .66s infinite}@keyframes bp{0%,100%{opacity:.35}50%{opacity:1}}`}</style>
      <g
        className={active ? "gf" : ""}
        style={{ transformOrigin: "10px 10px" }}
      >
        <rect
          x="2"
          y="6"
          width="16"
          height="10"
          rx="5"
          stroke={c}
          strokeWidth="1.4"
          fill={active ? `${c}15` : "none"}
        />
        <line
          x1="7"
          y1="9"
          x2="7"
          y2="13"
          stroke={c}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="5"
          y1="11"
          x2="9"
          y2="11"
          stroke={c}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle
          cx="13"
          cy="10"
          r="1.1"
          fill={c}
          className={active ? "bp" : ""}
          opacity={active ? 1 : 0.6}
        />
        <circle
          cx="15"
          cy="12"
          r="1.1"
          fill={c}
          className={active ? "bq" : ""}
          opacity={active ? 1 : 0.6}
        />
        <circle
          cx="11"
          cy="12"
          r="1.1"
          fill={c}
          className={active ? "br" : ""}
          opacity={active ? 1 : 0.6}
        />
      </g>
    </svg>
  );
}

function IconSettings({ active }) {
  const c = active ? "#34d399" : "#94a3b8";
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <style>{`.sg{animation:sg 5s linear infinite}@keyframes sg{from{transform:rotate(0)}to{transform:rotate(360deg)}}.sg2{animation:sg2 3s linear infinite}@keyframes sg2{from{transform:rotate(360deg)}to{transform:rotate(0)}}`}</style>
      <g
        className={active ? "sg" : ""}
        style={{ transformOrigin: "10px 10px" }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <rect
            key={i}
            x="9.2"
            y="3"
            width="1.6"
            height="3"
            rx=".8"
            fill={c}
            style={{
              transformOrigin: "10px 10px",
              transform: `rotate(${deg}deg)`,
              opacity: i % 2 === 0 ? 0.9 : 0.3,
            }}
          />
        ))}
      </g>
      <g
        className={active ? "sg2" : ""}
        style={{ transformOrigin: "10px 10px" }}
      >
        <circle
          cx="10"
          cy="10"
          r="4.5"
          stroke={c}
          strokeWidth="1.2"
          fill="none"
          opacity=".3"
        />
      </g>
      <circle cx="10" cy="10" r="2.5" fill={c} opacity=".9" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M11 11l3-3-3-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="14"
        y1="8"
        x2="6"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Taskbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isConnected, onlineUsers, totalUnread, setTotalUnread } = useSocket();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ✅ Chat sahifasiga kirganida unread ni reset qilish
  useEffect(() => {
    if (pathname === "/chat") {
      setTotalUnread(0);
    }
  }, [pathname, setTotalUnread]);

  const navItems = [
    {
      href: "/",
      icon: (a) => <IconDesktop active={a} />,
      label: "Desktop",
      activeColor: "var(--accent-color,#38bdf8)",
    },
    {
      href: "/chat",
      icon: (a) => <IconChat active={a} hasUnread={totalUnread > 0} />,
      label: "Chat",
      activeColor: "#38bdf8",
    },
    {
      href: "/games",
      icon: (a) => <IconGame active={a} />,
      label: "Games",
      activeColor: "#a78bfa",
    },
    {
      href: "/settings",
      icon: (a) => <IconSettings active={a} />,
      label: "Settings",
      activeColor: "#34d399",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes tbIn       { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes pulseDot   { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes unreadPing {
          0%   { transform:scale(1);   opacity:1; box-shadow:0 0 0 0 rgba(239,68,68,.8); }
          50%  { transform:scale(1.2); opacity:1; box-shadow:0 0 0 5px rgba(239,68,68,0); }
          100% { transform:scale(1);   opacity:1; box-shadow:0 0 0 0 rgba(239,68,68,0); }
        }
        .tb-nav-btn { position:relative; display:flex; flex-direction:column; align-items:center;
          gap:2px; padding:6px 14px; border-radius:10px; border:none; background:transparent;
          cursor:pointer; transition:all .18s ease; }
        .tb-nav-btn:hover { background:rgba(255,255,255,.05); }
        .tb-nav-btn.active { background:rgba(56,189,248,.12); }
        .tb-nav-label { font-family:monospace; font-size:9px; letter-spacing:.06em; }
      `}</style>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          animation: "tbIn .5s ease both",
        }}
      >
        <div
          style={{
            height: 1,
            background:
              "linear-gradient(to right,transparent,rgba(56,189,248,.35),rgba(167,139,250,.25),transparent)",
          }}
        />

        <div
          style={{
            background: "rgba(7,15,30,0.88)",
            backdropFilter: "blur(20px)",
            padding: "6px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              maxWidth: 960,
              margin: "0 auto",
            }}
          >
            {/* LEFT */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 140,
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`
                  }
                  alt={user?.username}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "2px solid var(--accent-color,#38bdf8)",
                    boxShadow: "0 0 10px var(--accent-color,#38bdf8)40",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: -1,
                    right: -1,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: "#22c55e",
                    border: "2px solid #070f1e",
                    boxShadow: "0 0 6px #22c55e",
                    animation: "pulseDot 2s infinite",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "#94a3b8",
                  letterSpacing: ".04em",
                }}
              >
                {user?.username}
              </span>
            </div>

            {/* CENTER */}
            <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {navItems.map(({ href, icon, label, activeColor }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{ textDecoration: "none" }}
                  >
                    <button
                      className={`tb-nav-btn ${isActive ? "active" : ""}`}
                      title={label}
                      style={{ color: isActive ? activeColor : "#64748b" }}
                    >
                      {icon(isActive)}
                      <span
                        className="tb-nav-label"
                        style={{ color: isActive ? activeColor : "#475569" }}
                      >
                        {label}
                        {/* ✅ Chat label da unread count */}
                        {label === "Chat" && totalUnread > 0 && (
                          <span
                            style={{
                              marginLeft: 4,
                              background: "#ef4444",
                              color: "#fff",
                              borderRadius: 99,
                              padding: "0 4px",
                              fontSize: 8,
                              fontWeight: 700,
                            }}
                          >
                            {totalUnread > 99 ? "99+" : totalUnread}
                          </span>
                        )}
                      </span>
                      {isActive && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: 2,
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: activeColor,
                            boxShadow: `0 0 6px ${activeColor}`,
                          }}
                        />
                      )}
                    </button>
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                minWidth: 140,
                justifyContent: "flex-end",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#475569",
                }}
              >
                <span style={{ color: "#38bdf8" }}>{onlineUsers.length}</span>{" "}
                online
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isConnected ? "#22c55e" : "#ef4444",
                    boxShadow: isConnected ? "0 0 6px #22c55e" : "none",
                  }}
                />
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#64748b",
                  letterSpacing: ".05em",
                }}
              >
                {time.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <button
                onClick={logout}
                title="Logout"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#475569",
                  padding: "4px 6px",
                  borderRadius: 8,
                  transition: "all .18s",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#f87171";
                  e.currentTarget.style.background = "rgba(239,68,68,.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#475569";
                  e.currentTarget.style.background = "none";
                }}
              >
                <IconLogout />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
