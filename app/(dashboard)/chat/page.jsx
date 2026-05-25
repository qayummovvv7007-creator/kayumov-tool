"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

// ── Constants ─────────────────────────────────────────────────────────────────
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
  "⚡",
  "🎮",
  "🚀",
  "👾",
  "🤖",
  "💻",
  "🌙",
  "⭐",
  "🫂",
  "🙏",
];

function timeStr(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function dayStr(date) {
  const d = new Date(date);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function avatarUrl(u) {
  return (
    u?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${u?.username}`
  );
}
// ✅ ID larni string ga o'tkazish — MongoDB ObjectId bilan === ishlamaydi
function toStr(id) {
  if (!id) return "";
  return id?.toString ? id.toString() : String(id);
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const SendIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <path
      d="M15.5 8.5L1.5 2l2 6.5-2 6.5 14-6.5z"
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
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M10 10l2.5 2.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

// ── User list item ────────────────────────────────────────────────────────────
function UserItem({ u, isSelected, isOnline, lastMsg, unread, onClick }) {
  const accent = "var(--accent-color, #38bdf8)";

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        cursor: "pointer",
        borderRadius: 12,
        margin: "2px 6px",
        background: isSelected ? "rgba(56,189,248,.1)" : "transparent",
        border: isSelected
          ? "1px solid rgba(56,189,248,.2)"
          : "1px solid transparent",
        transition: "all .15s",
      }}
      onMouseEnter={(e) => {
        if (!isSelected)
          e.currentTarget.style.background = "rgba(56,189,248,.05)";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Avatar + badge */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={avatarUrl(u)}
          alt={u.username}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `2px solid ${isSelected ? accent : unread > 0 ? "#22c55e" : "rgba(148,163,184,.15)"}`,
            transition: "all .15s",
            // ✅ Yangi xabar kelsa — yashil border + glow
            boxShadow: unread > 0 ? "0 0 10px rgba(34,197,94,0.5)" : "none",
          }}
        />

        {/* Online dot */}
        <span
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: isOnline ? "#22c55e" : "#475569",
            border: "2px solid #070f1e",
            boxShadow: isOnline ? "0 0 5px #22c55e" : "none",
          }}
        />

        {/* ✅ Yangi xabar soni — avatar ustida */}
        <style>{`
  @keyframes msgIn   { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

  @keyframes badgePulse {
    0%,100% { transform: scale(1); }
    50%     { transform: scale(1.2); }
  }

  .chat-input {
    flex:1; background:rgba(7,15,30,.9);
    border:1px solid rgba(148,163,184,.12);
    border-radius:12px; padding:10px 14px;
    font-family:monospace; font-size:13.5px;
    color:#f1f5f9; outline:none; resize:none;
    line-height:1.5; transition:border-color .2s;
  }
  .chat-input::placeholder { color:#334155; }
  .chat-input:focus { border-color:var(--accent-color,#38bdf8); }
  .send-btn {
    width:40px; height:40px; border-radius:11px; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    background:var(--accent-color,#38bdf8); color:#020c1b;
    transition:all .18s; flex-shrink:0;
  }
  .send-btn:hover:not(:disabled) { filter:brightness(1.15); transform:scale(1.06); }
  .send-btn:disabled { opacity:.35; cursor:not-allowed; }
  .icon-btn {
    background:none; border:none; cursor:pointer; padding:7px;
    border-radius:8px; display:flex; align-items:center; justify-content:center;
    transition:all .15s; color:#64748b;
  }
  .icon-btn:hover { color:var(--accent-color,#38bdf8); background:rgba(56,189,248,.08); }
  .search-input {
    flex:1; background:transparent; border:none; outline:none;
    font-family:monospace; font-size:12px; color:#94a3b8;
  }
  .search-input::placeholder { color:#334155; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:rgba(56,189,248,.15); border-radius:4px; }
`}</style>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              fontWeight: unread > 0 ? 800 : 700,
              color: isSelected ? accent : unread > 0 ? "#f1f5f9" : "#e2e8f0",
              letterSpacing: ".02em",
            }}
          >
            {u.username}
          </span>
          {lastMsg && (
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                color: unread > 0 ? "#22c55e" : "#334155",
              }}
            >
              {timeStr(lastMsg.createdAt)}
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 2,
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              // ✅ Yangi xabar bo'lsa — yashil va bold
              color: unread > 0 ? "#4ade80" : isOnline ? "#22c55e" : "#475569",
              fontWeight: unread > 0 ? 700 : 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 140,
            }}
          >
            {unread > 0
              ? lastMsg?.content // ✅ Oxirgi xabar matni ko'rinadi
              : isOnline
                ? "● online"
                : lastMsg
                  ? lastMsg.content
                  : "No messages yet"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg, isMe, showAvatar, myAvatar }) {
  const accent = "var(--accent-color, #38bdf8)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMe ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
        marginBottom: 6,
        animation: "msgIn .2s ease both",
        // ✅ O'z xabarim o'ngda, boshqaniki chapda
        justifyContent: isMe ? "flex-end" : "flex-start",
      }}
    >
      {/* Avatar — faqat boshqa odamda */}
      {!isMe && (
        <div style={{ width: 30, flexShrink: 0, alignSelf: "flex-end" }}>
          {showAvatar ? (
            <img
              src={avatarUrl(msg.sender)}
              alt=""
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "1.5px solid rgba(56,189,248,.25)",
              }}
            />
          ) : (
            <div style={{ width: 30 }} />
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isMe ? "flex-end" : "flex-start",
          gap: 3,
          maxWidth: "65%",
        }}
      >
        {/* Username — faqat boshqa odamda, birinchi xabarda */}
        {!isMe && showAvatar && (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: accent,
              letterSpacing: ".03em",
              paddingLeft: 4,
            }}
          >
            {msg.sender?.username}
          </span>
        )}

        {/* Xabar pufakchasi */}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: isMe
              ? "18px 4px 18px 18px" // o'ngda — o'tkir burchak o'ng tomonda
              : "4px 18px 18px 18px", // chapda — o'tkir burchak chap tomonda
            background: isMe
              ? `linear-gradient(135deg, ${accent} 0%, #2563eb 100%)` // ✅ yorqin ko'k
              : "rgba(20,30,55,.95)", // qoramtir
            border: isMe ? "none" : "1px solid rgba(56,189,248,.12)",
            fontFamily: "monospace",
            fontSize: 13.5,
            lineHeight: 1.65,
            color: isMe ? "#ffffff" : "#e2e8f0", // ✅ o'z xabarim oq matn
            wordBreak: "break-word",
            boxShadow: isMe
              ? `0 4px 16px ${accent}40` // ✅ glow effekti
              : "0 2px 8px rgba(0,0,0,.3)",
            // ✅ Min kenglik — qisqa xabar ham chiroyli ko'rinsin
            minWidth: 40,
            position: "relative",
          }}
        >
          {msg.content}

          {/* Temp xabar — yuborilmoqda indikatori */}
          {msg._id?.startsWith("temp-") && (
            <span
              style={{
                display: "block",
                fontSize: 9,
                color: "rgba(255,255,255,0.5)",
                textAlign: "right",
                marginTop: 2,
              }}
            >
              sending...
            </span>
          )}
        </div>

        {/* Vaqt */}
        {showAvatar && (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#334155",
              paddingRight: isMe ? 2 : 0,
              paddingLeft: isMe ? 0 : 4,
            }}
          >
            {timeStr(msg.createdAt)}
          </span>
        )}
      </div>

      {/* O'z avataram — o'ng tomonda */}
      {isMe && (
        <div style={{ width: 30, flexShrink: 0, alignSelf: "flex-end" }}>
          {showAvatar ? (
            <img
              src={myAvatar}
              alt=""
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: `1.5px solid ${accent}`,
              }}
            />
          ) : (
            <div style={{ width: 30 }} />
          )}
        </div>
      )}
    </div>
  );
}

// ── Day divider ───────────────────────────────────────────────────────────────
function DayDivider({ date }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "16px 0",
      }}
    >
      <div style={{ flex: 1, height: 1, background: "rgba(56,189,248,.08)" }} />
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "#334155",
          letterSpacing: ".1em",
        }}
      >
        {dayStr(date)}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(56,189,248,.08)" }} />
    </div>
  );
}

// ── Main Chat Page ────────────────────────────────────────────────────────────
export default function ChatPage() {
  const { user } = useAuth();
  const { socket, onlineUsers, isConnected } = useSocket();

  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [activeUser, setActiveUser] = useState(null);
  const [conversations, setConversations] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [typingFrom, setTypingFrom] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);
  const accent = "var(--accent-color, #38bdf8)";

  // ── Mening ID im ──────────────────────────────────────────────────────────
  const myId = toStr(user?.id || user?._id);

  // ── Barcha foydalanuvchilarni serverdan olish ─────────────────────────────
  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setAllUsers(d.users || []))
      .catch((err) => console.error("Users fetch error:", err));
  }, []);

  // ── Pastga scroll ─────────────────────────────────────────────────────────
  const scrollBottom = useCallback(() => {
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }, []);

  // ── Socket hodisalari ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // ✅ DM xabar keldi
    const onDmReceived = (msg) => {
      // ✅ Barcha ID larni string ga o'tkazish
      const senderId = toStr(msg.sender?._id || msg.sender);
      const receiverId = toStr(msg.receiver?._id || msg.receiver);

      // Men yozgan bo'lsam — receiver bilan suhbat oynasi
      // Menga yozilgan bo'lsa — sender bilan suhbat oynasi
      const otherId = senderId === myId ? receiverId : senderId;

      setConversations((prev) => ({
        ...prev,
        [otherId]: [...(prev[otherId] || []), msg],
      }));

      // Agar aktiv chat emas bo'lsa — unread count oshir
      setActiveUser((cur) => {
        const curId = toStr(cur?.id || cur?._id);
        if (curId !== otherId) {
          setUnreadCounts((u) => ({ ...u, [otherId]: (u[otherId] || 0) + 1 }));
        }
        return cur;
      });

      scrollBottom();
    };

    // ✅ DM tarixi keldi
    const onDmHistory = ({ withUserId, messages }) => {
      const uid = toStr(withUserId);
      setConversations((prev) => ({ ...prev, [uid]: messages }));
      scrollBottom();
    };

    // ✅ Yozish indikatori
    const onTyping = ({ userId }) => setTypingFrom(toStr(userId));
    const onStopTyping = () => setTypingFrom(null);

    socket.on("dm:received", onDmReceived);
    socket.on("dm:history", onDmHistory);
    socket.on("dm:user-typing", onTyping);
    socket.on("dm:user-stopped-typing", onStopTyping);

    return () => {
      socket.off("dm:received", onDmReceived);
      socket.off("dm:history", onDmHistory);
      socket.off("dm:user-typing", onTyping);
      socket.off("dm:user-stopped-typing", onStopTyping);
    };
  }, [socket, myId, scrollBottom]);

  // ── ✅ Polling — har 3 soniyada yangi xabarlar ──────────────────────────
  // Aktiv chat yangilanishi
  useEffect(() => {
    if (!activeUser) return;
    const uid = toStr(activeUser.id || activeUser._id);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/messages?withUser=${uid}`);
        const data = await res.json();
        if (data.messages) {
          setConversations((prev) => {
            const oldCount = (prev[uid] || []).length;
            const newCount = data.messages.length;

            if (newCount > oldCount) {
              const diff = newCount - oldCount;
              const newMsgs = data.messages.slice(oldCount);
              newMsgs.forEach((msg) => {
                const senderId = toStr(msg.sender?._id || msg.sender);
                if (senderId !== myId) {
                  setUnreadCounts((u) => ({
                    ...u,
                    [uid]: (u[uid] || 0) + diff,
                  }));
                }
              });
            }

            return { ...prev, [uid]: data.messages };
          });
        }
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, [activeUser, myId]);

  // Barcha chatlardan xabar tekshirish
  useEffect(() => {
    if (!myId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/messages/unread");
        const data = await res.json();
        if (data.unread) {
          setUnreadCounts(data.unread);
        }
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [myId]);

  // ── Suhbat ochish ─────────────────────────────────────────────────────────
  const openConversation = async (u) => {
    setActiveUser(u);
    const uid = toStr(u.id || u._id);

    // ✅ Badge ni darhol yo'qotish
    setUnreadCounts((prev) => ({ ...prev, [uid]: 0 }));
    setShowEmoji(false);
    setInput("");

    // ✅ Xabarlarni o'qildi deb belgilash
    fetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withUserId: uid }),
    }).catch(() => {});

    // ✅ Tarixni olish
    try {
      const res = await fetch(`/api/messages?withUser=${uid}`);
      const data = await res.json();
      if (data.messages) {
        setConversations((prev) => ({ ...prev, [uid]: data.messages }));
        scrollBottom();
      }
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  // ✅ YANGI sendMessage — socket o'rniga API ishlatadi
  const sendMessage = async () => {
    const content = input.trim();
    if (!content || !activeUser) return;

    const receiverId = toStr(activeUser.id || activeUser._id);

    // ✅ O'z xabarimni darhol ko'rsatish
    const tempMsg = {
      _id: `temp-${Date.now()}`,
      sender: {
        _id: myId, // ← bu muhim! isMe shu bilan tekshiriladi
        username: user?.username,
        avatar: user?.avatar,
      },
      receiver: { _id: receiverId },
      content,
      createdAt: new Date().toISOString(),
    };

    // Darhol UI ga qo'shish
    setConversations((prev) => ({
      ...prev,
      [receiverId]: [...(prev[receiverId] || []), tempMsg],
    }));
    setInput("");
    setShowEmoji(false);
    clearTimeout(typingTimer.current);
    scrollBottom();

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, content }),
      });
      const data = await res.json();

      if (data.message) {
        // Temp xabarni haqiqiy bilan almashtirish
        setConversations((prev) => ({
          ...prev,
          [receiverId]: (prev[receiverId] || []).map((m) =>
            m._id === tempMsg._id ? data.message : m,
          ),
        }));
      }
    } catch (err) {
      console.error("Send error:", err);
      // Xato bo'lsa olib tashlash
      setConversations((prev) => ({
        ...prev,
        [receiverId]: (prev[receiverId] || []).filter(
          (m) => m._id !== tempMsg._id,
        ),
      }));
    }
  };

  const handleInput = (val) => {
    setInput(val);
    if (!socket || !activeUser) return;
    const receiverId = toStr(activeUser.id || activeUser._id);
    socket.emit("dm:typing", { receiverId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("dm:stop-typing", { receiverId });
    }, 1500);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Foydalanuvchilar ro'yxatini birlashtirish ─────────────────────────────
  const mergedUsers = () => {
    // DB dan kelgan users (o'zimni olib tashlash)
    const filtered = allUsers.filter((u) => toStr(u.id || u._id) !== myId);

    // Online lekin DB da yo'q bo'lganlar (kam bo'ladi)
    const onlineOnly = onlineUsers
      .filter((u) => {
        const uid = toStr(u.userId);
        return (
          uid !== myId && !filtered.find((x) => toStr(x.id || x._id) === uid)
        );
      })
      .map((u) => ({
        id: u.userId,
        _id: u.userId,
        username: u.username,
        avatar: u.avatar,
      }));

    return [...filtered, ...onlineOnly];
  };

  const activeId = toStr(activeUser?.id || activeUser?._id);
  const activeMessages = conversations[activeId] || [];
  const activeIsOnline = onlineUsers.some((u) => toStr(u.userId) === activeId);

  // Search filter
  const displayUsers = mergedUsers().filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase()),
  );

  // Xabarlarni kunlarga guruhlash
  const groupedMessages = [];
  let lastDay = null;
  activeMessages.forEach((msg) => {
    const day = new Date(msg.createdAt).toDateString();
    if (day !== lastDay) {
      groupedMessages.push({ type: "day", date: msg.createdAt });
      lastDay = day;
    }
    groupedMessages.push({ type: "msg", msg });
  });

  return (
    <>
      <style>{`
        @keyframes msgIn   { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

        .chat-input {
          flex:1; background:rgba(7,15,30,.9);
          border:1px solid rgba(148,163,184,.12);
          border-radius:12px; padding:10px 14px;
          font-family:monospace; font-size:13.5px;
          color:#f1f5f9; outline:none; resize:none;
          line-height:1.5; transition:border-color .2s;
        }
        .chat-input::placeholder { color:#334155; }
        .chat-input:focus { border-color:var(--accent-color,#38bdf8); }

        .send-btn {
          width:40px; height:40px; border-radius:11px; border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          background:var(--accent-color,#38bdf8); color:#020c1b;
          transition:all .18s; flex-shrink:0;
        }
        .send-btn:hover:not(:disabled) { filter:brightness(1.15); transform:scale(1.06); }
        .send-btn:disabled { opacity:.35; cursor:not-allowed; }

        .icon-btn {
          background:none; border:none; cursor:pointer; padding:7px;
          border-radius:8px; display:flex; align-items:center; justify-content:center;
          transition:all .15s; color:#64748b;
        }
        .icon-btn:hover { color:var(--accent-color,#38bdf8); background:rgba(56,189,248,.08); }

        .search-input {
          flex:1; background:transparent; border:none; outline:none;
          font-family:monospace; font-size:12px; color:#94a3b8;
        }
        .search-input::placeholder { color:#334155; }

        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(56,189,248,.15); border-radius:4px; }
      `}</style>

      <div
        style={{
          display: "flex",
          height: "calc(100vh - 56px)",
          overflow: "hidden",
          animation: "fadeIn .3s ease",
        }}
      >
        {/* ══ CHAP PANEL: Foydalanuvchilar ══════════════════════════════════ */}
        <div
          style={{
            width: 260,
            flexShrink: 0,
            borderRight: "1px solid rgba(56,189,248,.1)",
            background: "rgba(5,10,22,.8)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 14px 10px",
              borderBottom: "1px solid rgba(56,189,248,.08)",
            }}
          >
            <h2
              style={{
                fontFamily: "monospace",
                fontWeight: 800,
                fontSize: 15,
                color: "#f1f5f9",
                margin: "0 0 12px",
                letterSpacing: ".02em",
              }}
            >
              Messages<span style={{ color: accent }}>_</span>
            </h2>

            {/* Search */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(7,15,30,.8)",
                borderRadius: 10,
                padding: "7px 11px",
                border: "1px solid rgba(148,163,184,.1)",
              }}
            >
              <SearchIcon />
              <input
                className="search-input"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Online soni */}
          <div style={{ padding: "8px 20px 4px" }}>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "#334155",
                letterSpacing: ".1em",
              }}
            >
              USERS —{" "}
              <span style={{ color: "#22c55e" }}>
                {Math.max(0, onlineUsers.length - 1)}
              </span>{" "}
              ONLINE
            </span>
          </div>

          {/* Users ro'yxati */}
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
            {displayUsers.length === 0 ? (
              <div
                style={{
                  padding: "24px 20px",
                  textAlign: "center",
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "#334155",
                }}
              >
                No users found
              </div>
            ) : (
              displayUsers.map((u) => {
                const uid = toStr(u.id || u._id);
                const isOnline = onlineUsers.some(
                  (o) => toStr(o.userId) === uid,
                );
                const msgs = conversations[uid] || [];
                const lastMsg = msgs[msgs.length - 1];
                const unread = unreadCounts[uid] || 0;

                return (
                  <UserItem
                    key={uid}
                    u={u}
                    isSelected={uid === activeId}
                    isOnline={isOnline}
                    lastMsg={lastMsg}
                    unread={unread}
                    onClick={() => openConversation(u)}
                  />
                );
              })
            )}
          </div>

          {/* Men (pastda) */}
          <div
            style={{
              padding: "10px 14px",
              borderTop: "1px solid rgba(56,189,248,.08)",
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={avatarUrl(user)}
                alt=""
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border: `2px solid ${accent}`,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                  border: "2px solid #050a16",
                }}
              />
            </div>
            <div>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#f1f5f9",
                  margin: 0,
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

        {/* ══ O'NG PANEL: Xabarlar ══════════════════════════════════════════ */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {activeUser ? (
            <>
              {/* Chat header */}
              <div
                style={{
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderBottom: "1px solid rgba(56,189,248,.1)",
                  background: "rgba(7,15,30,.7)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={avatarUrl(activeUser)}
                    alt=""
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: `2px solid ${activeIsOnline ? "#22c55e" : "rgba(148,163,184,.2)"}`,
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
                      background: activeIsOnline ? "#22c55e" : "#475569",
                      border: "2px solid #070f1e",
                      boxShadow: activeIsOnline ? "0 0 6px #22c55e" : "none",
                    }}
                  />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 800,
                      fontSize: 15,
                      color: "#f1f5f9",
                      margin: 0,
                    }}
                  >
                    {activeUser.username}
                  </p>
                  <p
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      margin: 0,
                      color: activeIsOnline ? "#22c55e" : "#475569",
                    }}
                  >
                    {toStr(typingFrom) === activeId ? (
                      <span style={{ color: accent }}>typing...</span>
                    ) : activeIsOnline ? (
                      "online"
                    ) : (
                      "offline"
                    )}
                  </p>
                </div>

                {/* Ulanish holati */}
                <div style={{ marginLeft: "auto" }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      display: "inline-block",
                      background: isConnected ? "#22c55e" : "#ef4444",
                      boxShadow: isConnected ? "0 0 6px #22c55e" : "none",
                    }}
                  />
                </div>
              </div>

              {/* Xabarlar ro'yxati */}
              <div
                style={{ flex: 1, overflowY: "auto", padding: "16px 20px 8px" }}
              >
                {activeMessages.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      gap: 14,
                      opacity: 0.4,
                    }}
                  >
                    <img
                      src={avatarUrl(activeUser)}
                      alt=""
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        border: "2px solid rgba(148,163,184,.2)",
                      }}
                    />
                    <p
                      style={{
                        fontFamily: "monospace",
                        fontSize: 13,
                        color: "#475569",
                        textAlign: "center",
                      }}
                    >
                      Start a conversation with
                      <br />
                      <span style={{ color: accent }}>
                        {activeUser.username}
                      </span>
                    </p>
                  </div>
                ) : (
                  groupedMessages.map((item, i) => {
                    if (item.type === "day") {
                      return <DayDivider key={`day-${i}`} date={item.date} />;
                    }

                    const msg = item.msg;

                    // ✅ isMe — men yozgan xabar (o'ng tomonda)
                    const senderId = toStr(msg.sender?._id || msg.sender);
                    const isMe = senderId === myId;

                    // Avatar faqat oxirgi ketma-ket xabarda ko'rinadi
                    const nextItem = groupedMessages[i + 1];
                    const nextSenderId =
                      nextItem?.type === "msg"
                        ? toStr(
                            nextItem.msg?.sender?._id || nextItem.msg?.sender,
                          )
                        : null;
                    const showAvatar = nextSenderId !== senderId;

                    return (
                      <Bubble
                        key={msg._id || i}
                        msg={msg}
                        isMe={isMe}
                        showAvatar={showAvatar}
                        myAvatar={avatarUrl(user)}
                        s
                      />
                    );
                  })
                )}

                {/* Yozmoqda indikatori */}
                {toStr(typingFrom) === activeId && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 0",
                      animation: "msgIn .2s ease",
                    }}
                  >
                    <img
                      src={avatarUrl(activeUser)}
                      alt=""
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: "1px solid rgba(56,189,248,.2)",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        padding: "8px 12px",
                        background: "rgba(15,25,48,.9)",
                        borderRadius: "4px 14px 14px 14px",
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
                            animation: `bounce .8s ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Emoji picker */}
              {showEmoji && (
                <div
                  style={{
                    margin: "0 16px",
                    padding: 10,
                    borderRadius: 14,
                    background: "rgba(7,15,30,.97)",
                    border: "1px solid rgba(56,189,248,.12)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3,
                    animation: "msgIn .15s ease",
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
                        fontSize: 19,
                        padding: "4px",
                        borderRadius: 7,
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

              {/* Input maydoni */}
              <div
                style={{
                  padding: "10px 16px",
                  background: "rgba(7,15,30,.8)",
                  backdropFilter: "blur(12px)",
                  borderTop: "1px solid rgba(56,189,248,.07)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "flex-end", gap: 7 }}
                >
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
                  <textarea
                    className="chat-input"
                    rows={1}
                    value={input}
                    onChange={(e) => {
                      handleInput(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 110) + "px";
                    }}
                    onKeyDown={handleKey}
                    placeholder={
                      isConnected
                        ? `Message ${activeUser.username}...`
                        : "Connecting..."
                    }
                    disabled={!isConnected}
                    style={{ minHeight: 40, maxHeight: 110 }}
                  />
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
            </>
          ) : (
            /* Bo'sh holat */
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                opacity: 0.35,
              }}
            >
              <div style={{ fontSize: 52 }}>💬</div>
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 15,
                    color: "#94a3b8",
                    margin: "0 0 6px",
                    fontWeight: 700,
                  }}
                >
                  Select a conversation
                </p>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: "#475569",
                    margin: 0,
                  }}
                >
                  Choose someone from the left to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
