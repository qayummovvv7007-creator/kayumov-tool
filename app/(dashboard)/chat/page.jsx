"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

// ── Helpers ──────────────────────────────────────────────────────────────────

const EMOJIS = [
  "😀",
  "😂",
  "🥹",
  "😍",
  "🤔",
  "😎",
  "🥳",
  "😤",
  "👍",
  "👎",
  "❤️",
  "🔥",
  "💯",
  "✨",
  "🎉",
  "💀",
  "🤣",
  "😭",
  "🫡",
  "👀",
  "💬",
  "⚡",
  "🎮",
  "🚀",
  "👾",
  "🤖",
  "💻",
  "🛸",
  "🌙",
  "⭐",
];

function timeStr(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function avatar(user) {
  return (
    user?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M16 9L2 2l2.5 7L2 16l14-7z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);
const EmojiIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="6.5" cy="7.5" r="1" fill="currentColor" />
    <circle cx="11.5" cy="7.5" r="1" fill="currentColor" />
    <path
      d="M6 11.5c.8 1.5 5.2 1.5 6 0"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M1.5 13.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <circle cx="12" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M14.5 13c0-1.933-1.12-3.5-2.5-3.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M2 2l10 10M12 2L2 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// ── Message Bubble ───────────────────────────────────────────────────────────

function Bubble({ msg, isMe }) {
  const accent = "var(--accent-color, #38bdf8)";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMe ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
        marginBottom: 12,
        animation: "msgIn .25s ease both",
      }}
    >
      {/* Avatar */}
      {!isMe && (
        <img
          src={avatar(msg.sender)}
          alt={msg.sender?.username}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            flexShrink: 0,
            border: "1.5px solid rgba(56,189,248,.25)",
            marginBottom: 2,
          }}
        />
      )}

      <div
        style={{
          maxWidth: "68%",
          display: "flex",
          flexDirection: "column",
          alignItems: isMe ? "flex-end" : "flex-start",
          gap: 3,
        }}
      >
        {/* Sender name */}
        {!isMe && (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: accent,
              opacity: 0.8,
              letterSpacing: ".04em",
            }}
          >
            {msg.sender?.username}
          </span>
        )}

        {/* Bubble */}
        <div
          style={{
            padding: "9px 14px",
            borderRadius: isMe ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
            background: isMe
              ? `linear-gradient(135deg, ${accent}cc, ${accent}88)`
              : "rgba(15,25,45,0.9)",
            border: isMe ? "none" : "1px solid rgba(56,189,248,.12)",
            fontFamily: "monospace",
            fontSize: 14,
            lineHeight: 1.55,
            color: isMe ? "#020c1b" : "#e2e8f0",
            wordBreak: "break-word",
            boxShadow: isMe ? `0 4px 16px ${accent}30` : "none",
          }}
        >
          {msg.content}
        </div>

        {/* Time */}
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "#334155",
            letterSpacing: ".03em",
          }}
        >
          {timeStr(msg.createdAt)}
        </span>
      </div>
    </div>
  );
}

// ── Online User Item ─────────────────────────────────────────────────────────

function OnlineUser({ u }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "7px 10px",
        borderRadius: 10,
        transition: "background .15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(56,189,248,.06)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={
            u.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
          }
          alt={u.username}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "1.5px solid rgba(56,189,248,.2)",
          }}
        />
        <span
          style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#22c55e",
            border: "2px solid #070f1e",
            boxShadow: "0 0 5px #22c55e",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 12,
          color: "#94a3b8",
          letterSpacing: ".03em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {u.username}
      </span>
    </div>
  );
}

// ── Main Chat Page ───────────────────────────────────────────────────────────

export default function ChatPage() {
  const { user } = useAuth();
  const { socket, onlineUsers, isConnected } = useSocket();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showUsers, setShowUsers] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimer = useRef(null);

  const accent = "var(--accent-color, #38bdf8)";

  // ── Auto scroll ──
  const scrollBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "instant",
    });
  }, []);

  // ── Socket events ──
  useEffect(() => {
    if (!socket) return;

    const onHistory = (msgs) => {
      setMessages(msgs);
      setTimeout(() => scrollBottom(false), 50);
    };

    const onReceived = (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(scrollBottom, 50);
    };

    const onTyping = ({ userId, username }) => {
      if (userId === user?.id) return;
      setTypingUsers((prev) =>
        prev.includes(username) ? prev : [...prev, username],
      );
    };

    const onStopTyping = ({ userId }) => {
      const u = onlineUsers.find((o) => o.userId === userId);
      if (u) setTypingUsers((prev) => prev.filter((n) => n !== u.username));
    };

    socket.on("messages:history", onHistory);
    socket.on("message:received", onReceived);
    socket.on("chat:user-typing", onTyping);
    socket.on("chat:user-stopped-typing", onStopTyping);

    return () => {
      socket.off("messages:history", onHistory);
      socket.off("message:received", onReceived);
      socket.off("chat:user-typing", onTyping);
      socket.off("chat:user-stopped-typing", onStopTyping);
    };
  }, [socket, user, onlineUsers, scrollBottom]);

  // ── Send message ──
  const sendMessage = () => {
    const content = input.trim();
    if (!content || !socket || !isConnected) return;
    socket.emit("message:send", { content, room: "global" });
    socket.emit("chat:stop-typing", { room: "global" });
    setInput("");
    setShowEmoji(false);
    clearTimeout(typingTimer.current);
  };

  // ── Typing indicator ──
  const handleInput = (val) => {
    setInput(val);
    if (!socket) return;
    socket.emit("chat:typing", { room: "global" });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("chat:stop-typing", { room: "global" });
    }, 1500);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @keyframes msgIn   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes typing  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .chat-input { flex:1; background:rgba(7,15,30,.9); border:1px solid rgba(148,163,184,.15);
          border-radius:12px; padding:11px 16px; font-family:monospace; font-size:14px;
          color:#f1f5f9; outline:none; resize:none; line-height:1.5;
          transition:border-color .2s; }
        .chat-input::placeholder { color:#334155; }
        .chat-input:focus { border-color:var(--accent-color,#38bdf8); }
        .send-btn { width:42px; height:42px; border-radius:12px; border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          background:var(--accent-color,#38bdf8); color:#020c1b;
          transition:all .2s; flex-shrink:0; }
        .send-btn:hover { filter:brightness(1.15); transform:scale(1.05); }
        .send-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }
        .icon-btn { background:none; border:none; cursor:pointer; padding:8px; border-radius:9px;
          display:flex; align-items:center; justify-content:center;
          transition:all .18s; color:#64748b; }
        .icon-btn:hover { color:var(--accent-color,#38bdf8); background:rgba(56,189,248,.08); }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(56,189,248,.2); border-radius:4px; }
      `}</style>

      <div
        style={{
          display: "flex",
          height: "calc(100vh - 56px)",
          background: "transparent",
          overflow: "hidden",
          animation: "fadeIn .3s ease",
        }}
      >
        {/* ── LEFT: Messages ───────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(56,189,248,.1)",
              background: "rgba(7,15,30,.6)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "monospace",
                  fontWeight: 800,
                  fontSize: 16,
                  color: "#f1f5f9",
                  margin: 0,
                  letterSpacing: ".02em",
                }}
              >
                # global
                <span style={{ color: accent }}>_</span>
              </h2>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#475569",
                  margin: "2px 0 0",
                  letterSpacing: ".04em",
                }}
              >
                {messages.length} messages · {onlineUsers.length} online
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Connection dot */}
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: isConnected ? "#22c55e" : "#ef4444",
                  boxShadow: isConnected ? "0 0 8px #22c55e" : "none",
                  display: "inline-block",
                }}
              />

              {/* Toggle users */}
              <button
                className="icon-btn"
                onClick={() => setShowUsers((p) => !p)}
                title="Online users"
              >
                <UsersIcon />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 20px 8px",
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: 12,
                  opacity: 0.4,
                }}
              >
                <span style={{ fontSize: 40 }}>💬</span>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: "#475569",
                  }}
                >
                  No messages yet. Say hi!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <Bubble
                  key={msg._id}
                  msg={msg}
                  isMe={
                    msg.sender?._id === user?.id ||
                    msg.sender?._id === user?._id
                  }
                />
              ))
            )}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 0",
                  animation: "msgIn .2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    padding: "8px 14px",
                    background: "rgba(15,25,45,.9)",
                    borderRadius: "4px 16px 16px 16px",
                    border: "1px solid rgba(56,189,248,.1)",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: accent,
                        display: "block",
                        animation: `typing .8s ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "#475569",
                  }}
                >
                  {typingUsers.join(", ")} typing...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Emoji picker */}
          {showEmoji && (
            <div
              style={{
                margin: "0 16px",
                padding: 12,
                borderRadius: 14,
                background: "rgba(7,15,30,.95)",
                border: "1px solid rgba(56,189,248,.15)",
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                animation: "msgIn .2s ease",
              }}
            >
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setInput((p) => p + e)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 20,
                    padding: "4px",
                    borderRadius: 8,
                    transition: "transform .1s",
                  }}
                  onMouseEnter={(ev) =>
                    (ev.currentTarget.style.transform = "scale(1.3)")
                  }
                  onMouseLeave={(ev) =>
                    (ev.currentTarget.style.transform = "scale(1)")
                  }
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(7,15,30,.7)",
              backdropFilter: "blur(12px)",
              borderTop: "1px solid rgba(56,189,248,.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              {/* Emoji toggle */}
              <button
                className="icon-btn"
                onClick={() => setShowEmoji((p) => !p)}
                style={{
                  color: showEmoji ? accent : "#64748b",
                  marginBottom: 1,
                }}
              >
                <EmojiIcon />
              </button>

              {/* Text input */}
              <textarea
                ref={inputRef}
                className="chat-input"
                rows={1}
                value={input}
                onChange={(e) => {
                  handleInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKey}
                placeholder={
                  isConnected
                    ? "Type a message... (Enter to send)"
                    : "Connecting..."
                }
                disabled={!isConnected}
                style={{ minHeight: 42, maxHeight: 120 }}
              />

              {/* Send */}
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={!input.trim() || !isConnected}
                style={{ marginBottom: 1 }}
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Online Users ───────────────────────────────── */}
        {showUsers && (
          <div
            style={{
              width: 210,
              flexShrink: 0,
              borderLeft: "1px solid rgba(56,189,248,.1)",
              background: "rgba(5,12,25,.7)",
              backdropFilter: "blur(12px)",
              display: "flex",
              flexDirection: "column",
              animation: "fadeIn .25s ease",
            }}
          >
            {/* Users header */}
            <div
              style={{
                padding: "14px 14px 10px",
                borderBottom: "1px solid rgba(56,189,248,.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#475569",
                  letterSpacing: ".1em",
                }}
              >
                ONLINE —{" "}
                <span style={{ color: "#22c55e" }}>{onlineUsers.length}</span>
              </span>
              <button
                className="icon-btn"
                onClick={() => setShowUsers(false)}
                style={{ padding: 4 }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Users list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 4px" }}>
              {onlineUsers.map((u) => (
                <OnlineUser key={u.userId} u={u} />
              ))}
            </div>

            {/* My info */}
            <div
              style={{
                padding: "10px 14px",
                borderTop: "1px solid rgba(56,189,248,.08)",
                display: "flex",
                alignItems: "center",
                gap: 9,
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img
                  src={avatar(user)}
                  alt={user?.username}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: `2px solid ${accent}`,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: -1,
                    right: -1,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#22c55e",
                    border: "2px solid #050c19",
                  }}
                />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: "#f1f5f9",
                    margin: 0,
                    fontWeight: 700,
                  }}
                >
                  {user?.username}
                </p>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "#22c55e",
                    margin: 0,
                  }}
                >
                  you
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
