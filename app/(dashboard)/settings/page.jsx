"use client";

import { useState } from "react";
import ThemePanel from "@/components/settings/ThemePanel";
import AvatarPicker from "@/components/settings/AvatarPicker";
import DangerPanel from "@/components/settings/DangerPanel";
import ProfilePanel from "@/components/settings/ProfilePanel";

const TABS = [
  {
    id: "profile",
    label: "PROFILE",
    color: "#38bdf8",
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle
          cx="6.5"
          cy="4"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M1 12c0-3.038 2.462-5.5 5.5-5.5S12 8.962 12 12"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "avatar",
    label: "AVATAR",
    color: "#a78bfa",
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle
          cx="6.5"
          cy="6.5"
          r="5.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <circle cx="6.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M2 11c0-2.5 2-4.5 4.5-4.5S11 8.5 11 11"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "theme",
    label: "THEME",
    color: "#34d399",
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle
          cx="6.5"
          cy="6.5"
          r="5.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <circle cx="4.5" cy="5.5" r="1" fill="currentColor" opacity=".8" />
        <circle cx="6.5" cy="4" r="1" fill="currentColor" opacity=".8" />
        <circle cx="8.5" cy="5.5" r="1" fill="currentColor" opacity=".8" />
        <circle cx="8" cy="8" r="1" fill="currentColor" opacity=".8" />
        <circle cx="5" cy="8" r="1" fill="currentColor" opacity=".8" />
      </svg>
    ),
  },
  {
    id: "danger",
    label: "DANGER",
    color: "#ef4444",
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path
          d="M6.5 1.5L12 11H1L6.5 1.5z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <line
          x1="6.5"
          y1="5"
          x2="6.5"
          y2="8"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="6.5" cy="9.5" r=".7" fill="currentColor" />
      </svg>
    ),
  },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const activeTab = TABS.find((t) => t.id === tab);

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes tabIn  { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
        .s-tab {
          flex:1; display:flex; align-items:center; justify-content:center; gap:6px;
          padding:8px 10px; border:none; border-radius:9px; cursor:pointer;
          font-family:monospace; font-size:11px; letter-spacing:.07em;
          transition:all .18s; background:transparent; white-space:nowrap;
        }
      `}</style>

      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "44px 24px 100px",
          animation: "fadeUp .4s ease both",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              letterSpacing: ".14em",
              color: activeTab?.color,
              marginBottom: 7,
              opacity: 0.8,
            }}
          >
            // SYSTEM CONFIGURATION
          </p>
          <h1
            style={{
              fontFamily: "monospace",
              fontWeight: 800,
              fontSize: 26,
              color: "#f1f5f9",
              margin: 0,
            }}
          >
            Settings<span style={{ color: activeTab?.color }}>_</span>
          </h1>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 3,
            marginBottom: 20,
            background: "rgba(7,15,30,.85)",
            padding: 4,
            borderRadius: 13,
            border: "1px solid rgba(148,163,184,.1)",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              className="s-tab"
              onClick={() => setTab(t.id)}
              style={{
                color: tab === t.id ? t.color : "#475569",
                background: tab === t.id ? `${t.color}15` : "transparent",
                boxShadow:
                  tab === t.id ? `inset 0 0 0 1px ${t.color}25` : "none",
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div
          style={{
            background: "rgba(10,20,38,0.8)",
            backdropFilter: "blur(16px)",
            border: `1px solid ${activeTab?.color}20`,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: `0 0 40px ${activeTab?.color}08`,
            transition: "border-color .3s",
          }}
        >
          <div
            style={{
              height: 1,
              background: `linear-gradient(to right, transparent, ${activeTab?.color}55, transparent)`,
            }}
          />
          <div
            style={{ padding: "26px 22px", animation: "tabIn .2s ease both" }}
            key={tab}
          >
            {tab === "profile" && <ProfilePanel />}
            {tab === "avatar" && <AvatarPicker />}
            {tab === "theme" && <ThemePanel />}
            {tab === "danger" && <DangerPanel />}
          </div>
        </div>
      </div>
    </>
  );
}
