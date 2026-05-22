// components/chat/MessageBubble.jsx
// Individual chat xabari komponenti

"use client";

export default function MessageBubble({ message, isOwn }) {
  const sender = message.sender;
  const timeStr = new Date(message.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex gap-2.5 group animate-fade-in ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <img
        src={
          sender?.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${sender?.username}`
        }
        alt={sender?.username}
        className="w-8 h-8 rounded-full flex-shrink-0 border border-slate-700"
      />

      {/* Xabar kontenti */}
      <div
        className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}
      >
        {/* Username va vaqt */}
        <div
          className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
        >
          <span className="text-xs font-mono font-semibold text-[var(--accent-color)]">
            {sender?.username}
          </span>
          <span className="text-[10px] text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            {timeStr}
          </span>
        </div>

        {/* Xabar matni */}
        <div
          className={`
            px-3 py-2 rounded-2xl text-sm font-mono break-words
            ${
              isOwn
                ? "bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/30 text-white rounded-tr-sm"
                : "bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-tl-sm"
            }
          `}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
