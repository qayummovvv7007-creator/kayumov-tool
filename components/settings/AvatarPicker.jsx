"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

// ── Preset avatars ────────────────────────────────────────────────────────────

const PRESETS = [
  {
    id: "girl1",
    label: "Ayla",
    category: "girl",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayla&backgroundColor=b6e3f4&hair=long01&hairColor=2c1b18&clotheColor=ff488e&eyes=happy&mouth=smile",
  },
  {
    id: "girl2",
    label: "Zara",
    category: "girl",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zara&backgroundColor=c0aede&hair=long02&hairColor=4a312c&clotheColor=929292&eyes=wink&mouth=twinkle",
  },
  {
    id: "boy1",
    label: "Amir",
    category: "boy",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amir&backgroundColor=d1f4e0&hair=short01&hairColor=2c1b18&clotheColor=3c4f5c&eyes=default&mouth=smile",
  },
  {
    id: "boy2",
    label: "Dani",
    category: "boy",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dani&backgroundColor=ffd5dc&hair=short03&hairColor=b58143&clotheColor=5199e4&eyes=squint&mouth=default",
  },
  {
    id: "woman1",
    label: "Sofia",
    category: "woman",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia&backgroundColor=ffdfbf&hair=long06&hairColor=a55728&clotheColor=ff5c5c&eyes=closed&mouth=smile",
    age: "adult",
  },
  {
    id: "man1",
    label: "Marco",
    category: "man",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marco&backgroundColor=c0aede&hair=short04&hairColor=afafaf&clotheColor=3c4f5c&eyes=default&mouth=serious",
    age: "adult",
  },
  {
    id: "insta",
    label: "Classic",
    category: "default",
    url: "https://api.dicebear.com/7.x/personas/svg?seed=classic&backgroundColor=b6e3f4",
  },
  {
    id: "pixel",
    label: "Pixel",
    category: "default",
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel&backgroundColor=b6e3f4",
  },
];

const CATEGORY_LABELS = {
  girl: "👧 Girls",
  boy: "👦 Boys",
  woman: "👩 Women",
  man: "👨 Men",
  default: "⭐ Classic",
};

// ── Upload icon ───────────────────────────────────────────────────────────────

const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path
      d="M11 14V4M11 4L7.5 7.5M11 4l3.5 3.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 15v2a2 2 0 002 2h10a2 2 0 002-2v-2"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M2 6l3 3 5-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M14 12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1h1.5L6 3h4l1.5 2H13a1 1 0 011 1v6z"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <circle cx="8" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

// ── Main component ────────────────────────────────────────────────────────────

export default function AvatarPicker() {
  const { user, updateUser } = useAuth();

  const [selected, setSelected] = useState(user?.avatar || null);
  const [preview, setPreview] = useState(user?.avatar || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const accent = "var(--accent-color, #38bdf8)";

  // ── File upload ──
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return alert("Max 5MB");
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setSelected(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // ── Save ──
  const handleSave = async () => {
    if (!selected || selected === user?.avatar) return;
    setSaving(true);
    try {
      const res = await fetch("/api/users/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: selected }),
      });
      if (res.ok) {
        updateUser({ avatar: selected });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  // Group presets by category
  const categories = [...new Set(PRESETS.map((p) => p.category))];

  return (
    <>
      <style>{`
        @keyframes avatarIn  { from{opacity:0;transform:scale(.85) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes ringPulse { 0%{box-shadow:0 0 0 0 var(--accent-color,#38bdf8)} 70%{box-shadow:0 0 0 8px transparent} 100%{box-shadow:0 0 0 0 transparent} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes savedPop  { 0%{opacity:0;transform:scale(.8)} 40%{transform:scale(1.1)} 100%{opacity:1;transform:scale(1)} }
        @keyframes spin      { to{transform:rotate(360deg)} }

        .av-card {
          position: relative; border-radius: 16px; overflow: hidden;
          cursor: pointer; transition: all .2s ease;
          border: 2px solid transparent;
          background: rgba(7,15,30,.7);
        }
        .av-card:hover { transform: translateY(-3px) scale(1.04); }
        .av-card.active {
          border-color: var(--accent-color,#38bdf8);
          box-shadow: 0 0 20px rgba(56,189,248,.3);
          animation: ringPulse .6s ease;
        }
        .av-img { width:100%; aspect-ratio:1; object-fit:cover; display:block;
          transition: transform .25s ease; padding: 8px; box-sizing: border-box; }
        .av-card:hover .av-img { transform: scale(1.08); }
        .av-card.active .av-img { animation: float 3s ease-in-out infinite; }
        .upload-zone {
          border: 2px dashed rgba(148,163,184,.2); border-radius: 14px;
          padding: 28px 20px; text-align: center; cursor: pointer;
          transition: all .2s; background: rgba(7,15,30,.5);
        }
        .upload-zone.drag { border-color: var(--accent-color,#38bdf8); background: rgba(56,189,248,.06); }
        .upload-zone:hover { border-color: rgba(148,163,184,.4); background: rgba(7,15,30,.8); }
        .save-btn {
          width: 100%; padding: 13px; border-radius: 12px; border: none;
          font-family: monospace; font-size: 13px; font-weight: 700;
          letter-spacing: .08em; cursor: pointer; transition: all .2s;
          position: relative; overflow: hidden;
        }
        .save-btn:hover:not(:disabled) { filter:brightness(1.12); transform:translateY(-1px); box-shadow:0 8px 24px rgba(56,189,248,.3); }
        .save-btn:disabled { opacity:.5; cursor:not-allowed; }
        .save-btn::after { content:""; position:absolute; inset:0;
          background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.15) 50%,transparent 60%);
          transform:translateX(-100%); transition:transform .4s; }
        .save-btn:hover:not(:disabled)::after { transform:translateX(100%); }
        .cat-label { font-family:monospace; font-size:11px; letter-spacing:.1em;
          color:#475569; margin:0 0 10px; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* ── Current avatar preview ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: `3px solid ${accent}`,
                boxShadow: `0 0 24px rgba(56,189,248,.35)`,
                overflow: "hidden",
                background: "rgba(7,15,30,.8)",
                animation: "float 4s ease-in-out infinite",
              }}
            >
              <img
                src={
                  preview ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`
                }
                alt="current avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            {/* Camera overlay */}
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: accent,
                border: "2px solid #070f1e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#020c1b",
                transition: "transform .2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <CameraIcon />
            </button>
          </div>

          <div>
            <p
              style={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: 16,
                color: "#f1f5f9",
                margin: "0 0 4px",
              }}
            >
              {user?.username}
            </p>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "#475569",
                margin: 0,
                letterSpacing: ".06em",
              }}
            >
              {selected === user?.avatar
                ? "// NO CHANGES"
                : "// UNSAVED CHANGES"}
            </p>
          </div>
        </div>

        {/* ── Preset categories ── */}
        {categories.map((cat) => (
          <div key={cat}>
            <p className="cat-label">{CATEGORY_LABELS[cat]}</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                gap: 10,
              }}
            >
              {PRESETS.filter((p) => p.category === cat).map((p, i) => (
                <div
                  key={p.id}
                  className={`av-card ${selected === p.url ? "active" : ""}`}
                  onClick={() => {
                    setSelected(p.url);
                    setPreview(p.url);
                  }}
                  onMouseEnter={() => setHovered(p.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ animation: `avatarIn .3s ${i * 0.06}s both ease` }}
                >
                  <img src={p.url} alt={p.label} className="av-img" />

                  {/* Label on hover */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "4px 0",
                      background: "rgba(7,15,30,.85)",
                      fontFamily: "monospace",
                      fontSize: 9,
                      color: selected === p.url ? accent : "#64748b",
                      textAlign: "center",
                      letterSpacing: ".06em",
                      transition: "opacity .15s",
                    }}
                  >
                    {p.label.toUpperCase()}
                  </div>

                  {/* Checkmark */}
                  {selected === p.url && (
                    <div
                      style={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: accent,
                        color: "#020c1b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "savedPop .3s ease",
                      }}
                    >
                      <CheckIcon />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* ── Upload zone ── */}
        <div>
          <p className="cat-label">📁 UPLOAD FROM COMPUTER</p>
          <div
            className={`upload-zone ${dragOver ? "drag" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <div
              style={{
                color: dragOver ? accent : "#475569",
                transition: "color .2s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <UploadIcon />
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  margin: 0,
                  color: dragOver ? accent : "#64748b",
                }}
              >
                {dragOver ? "DROP TO UPLOAD" : "DRAG & DROP OR CLICK"}
              </p>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  margin: 0,
                  color: "#334155",
                }}
              >
                PNG, JPG, WEBP · max 5MB
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        </div>

        {/* ── Save button ── */}
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving || !selected || selected === user?.avatar}
          style={{
            background: saved
              ? "rgba(34,197,94,.15)"
              : `var(--accent-color,#38bdf8)`,
            color: saved ? "#22c55e" : "#020c1b",
            border: saved ? "1px solid rgba(34,197,94,.3)" : "none",
          }}
        >
          {saving ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                style={{ animation: "spin 1s linear infinite" }}
              >
                <circle
                  cx="7"
                  cy="7"
                  r="5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="20"
                  strokeDashoffset="8"
                />
              </svg>
              SAVING...
            </span>
          ) : saved ? (
            <span style={{ animation: "savedPop .3s ease" }}>✓ SAVED!</span>
          ) : (
            "SAVE AVATAR →"
          )}
        </button>
      </div>
    </>
  );
}
