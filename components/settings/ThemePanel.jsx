"use client";

import { useState } from "react";
import { useTheme, PRESET_THEMES } from "@/context/ThemeContext";

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path
        d="M2 5l2.5 2.5L8 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaletteIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke={color} strokeWidth="1.3" />
      <circle cx="5.5" cy="7" r="1.2" fill={color} opacity=".8" />
      <circle cx="8" cy="5" r="1.2" fill={color} opacity=".8" />
      <circle cx="10.5" cy="7" r="1.2" fill={color} opacity=".8" />
      <circle cx="9.5" cy="10" r="1.2" fill={color} opacity=".8" />
      <circle cx="6.5" cy="10" r="1.2" fill={color} opacity=".8" />
    </svg>
  );
}

function SliderIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line
        x1="2"
        y1="5"
        x2="14"
        y2="5"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity=".4"
      />
      <circle cx="9" cy="5" r="2" fill={color} />
      <line
        x1="2"
        y1="11"
        x2="14"
        y2="11"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity=".4"
      />
      <circle cx="5" cy="11" r="2" fill={color} />
    </svg>
  );
}

export default function ThemePanel() {
  const { theme, applyTheme } = useTheme();
  const [customBg, setCustomBg] = useState(theme.bgColor);
  const [customAccent, setCustomAccent] = useState(theme.accentColor);
  const [tab, setTab] = useState("presets"); // "presets" | "custom"

  const accent = "var(--accent-color, #38bdf8)";

  const handleCustomApply = () => {
    applyTheme({
      id: "custom",
      name: "Custom",
      bgColor: customBg,
      accentColor: customAccent,
      gradient: "none",
    });
  };

  return (
    <>
      <style>{`
        @keyframes cardIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        .theme-card { position:relative; border-radius:14px; overflow:hidden; cursor:pointer;
          border:1.5px solid rgba(148,163,184,.1); transition:all .2s ease; }
        .theme-card:hover { border-color:rgba(148,163,184,.3); transform:translateY(-2px); }
        .theme-card.selected { transform:translateY(-2px); }
        .tab-btn { background:none; border:none; cursor:pointer; padding:8px 18px;
          font-family:monospace; font-size:12px; letter-spacing:.08em; border-radius:8px;
          transition:all .18s; }
        .color-row { display:flex; align-items:center; gap:10px; }
        .hex-input { flex:1; background:rgba(7,15,30,.8); border:1px solid rgba(148,163,184,.15);
          border-radius:8px; padding:9px 12px; font-family:monospace; font-size:13px;
          color:#f1f5f9; outline:none; transition:border-color .2s; }
        .hex-input:focus { border-color:var(--accent-color,#38bdf8); }
        .apply-btn { width:100%; padding:11px; border:1px solid rgba(56,189,248,.3);
          border-radius:10px; background:rgba(56,189,248,.08); font-family:monospace;
          font-size:13px; font-weight:700; letter-spacing:.08em; cursor:pointer;
          transition:all .2s; position:relative; overflow:hidden; }
        .apply-btn:hover { background:rgba(56,189,248,.18); box-shadow:0 0 20px rgba(56,189,248,.15); transform:translateY(-1px); }
        .apply-btn::after { content:""; position:absolute; inset:0;
          background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.1) 50%,transparent 60%);
          transform:translateX(-100%); transition:transform .4s; }
        .apply-btn:hover::after { transform:translateX(100%); }
      `}</style>

      {/* Tab switcher */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 28,
          background: "rgba(7,15,30,.6)",
          padding: 4,
          borderRadius: 12,
          border: "1px solid rgba(148,163,184,.1)",
        }}
      >
        {[
          {
            id: "presets",
            label: "PRESETS",
            icon: (
              <PaletteIcon
                color={
                  tab === "presets" ? "var(--accent-color,#38bdf8)" : "#64748b"
                }
              />
            ),
          },
          {
            id: "custom",
            label: "CUSTOM",
            icon: (
              <SliderIcon
                color={
                  tab === "custom" ? "var(--accent-color,#38bdf8)" : "#64748b"
                }
              />
            ),
          },
        ].map((t) => (
          <button
            key={t.id}
            className="tab-btn"
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              color: tab === t.id ? accent : "#64748b",
              background: tab === t.id ? "rgba(56,189,248,.1)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Presets ── */}
      {tab === "presets" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          {PRESET_THEMES.map((preset, i) => {
            const isSelected = theme.id === preset.id;
            return (
              <button
                key={preset.id}
                className={`theme-card ${isSelected ? "selected" : ""}`}
                onClick={() => applyTheme(preset)}
                style={{
                  borderColor: isSelected
                    ? preset.accentColor
                    : "rgba(148,163,184,.1)",
                  boxShadow: isSelected
                    ? `0 0 20px ${preset.accentColor}30`
                    : "none",
                  animation: `cardIn .3s ${i * 0.04}s both ease`,
                  background: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {/* Preview */}
                <div
                  style={{
                    height: 64,
                    background:
                      preset.gradient !== "none"
                        ? preset.gradient
                        : preset.bgColor,
                    position: "relative",
                  }}
                >
                  {/* Accent strip */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: preset.accentColor,
                      boxShadow: `0 0 8px ${preset.accentColor}`,
                    }}
                  />
                  {/* Shimmer dot */}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: preset.accentColor,
                      boxShadow: `0 0 6px ${preset.accentColor}`,
                      opacity: 0.8,
                    }}
                  />
                </div>

                {/* Label */}
                <div
                  style={{
                    padding: "8px 10px",
                    background: "rgba(7,15,30,.85)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#f1f5f9",
                      letterSpacing: ".04em",
                    }}
                  >
                    {preset.name.toUpperCase()}
                  </span>
                  {isSelected && (
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: preset.accentColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#020c1b",
                        flexShrink: 0,
                      }}
                    >
                      <CheckIcon />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Custom ── */}
      {tab === "custom" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Preview */}
          <div
            style={{
              height: 80,
              borderRadius: 12,
              overflow: "hidden",
              background: customBg,
              position: "relative",
              border: "1px solid rgba(148,163,184,.1)",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                background: customAccent,
                boxShadow: `0 0 10px ${customAccent}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "monospace",
                fontSize: 12,
                color: customAccent,
                opacity: 0.6,
                letterSpacing: ".1em",
              }}
            >
              PREVIEW
            </div>
          </div>

          {/* BG color */}
          <div>
            <label
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "#64748b",
                letterSpacing: ".1em",
                display: "block",
                marginBottom: 8,
              }}
            >
              BACKGROUND COLOR
            </label>
            <div className="color-row">
              <input
                type="color"
                value={customBg}
                onChange={(e) => setCustomBg(e.target.value)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: "1px solid rgba(148,163,184,.2)",
                  cursor: "pointer",
                  background: "none",
                  padding: 2,
                }}
              />
              <input
                type="text"
                value={customBg}
                onChange={(e) => setCustomBg(e.target.value)}
                className="hex-input"
                placeholder="#0a0f1e"
              />
            </div>
          </div>

          {/* Accent color */}
          <div>
            <label
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "#64748b",
                letterSpacing: ".1em",
                display: "block",
                marginBottom: 8,
              }}
            >
              ACCENT COLOR
            </label>
            <div className="color-row">
              <input
                type="color"
                value={customAccent}
                onChange={(e) => setCustomAccent(e.target.value)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: "1px solid rgba(148,163,184,.2)",
                  cursor: "pointer",
                  background: "none",
                  padding: 2,
                }}
              />
              <input
                type="text"
                value={customAccent}
                onChange={(e) => setCustomAccent(e.target.value)}
                className="hex-input"
                placeholder="#38bdf8"
              />
            </div>
          </div>

          {/* Apply */}
          <button
            className="apply-btn"
            onClick={handleCustomApply}
            style={{ color: customAccent, borderColor: `${customAccent}50` }}
          >
            APPLY THEME →
          </button>
        </div>
      )}
    </>
  );
}
