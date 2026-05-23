"use client";

import ThemePanel from "@/components/settings/ThemePanel";

export default function SettingsPage() {
  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
      `}</style>

      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "48px 24px 100px",
          animation: "fadeUp .4s ease both",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "#34d399",
              letterSpacing: ".12em",
              marginBottom: 8,
              opacity: 0.8,
            }}
          >
            // SYSTEM CONFIGURATION
          </p>
          <h1
            style={{
              fontFamily: "monospace",
              fontWeight: 800,
              fontSize: 28,
              color: "#f1f5f9",
              margin: 0,
              letterSpacing: "-.01em",
            }}
          >
            Settings
            <span style={{ color: "#34d399" }}>_</span>
          </h1>
        </div>

        {/* Panel */}
        <div
          style={{
            background: "rgba(10,20,38,0.7)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(52,211,153,.12)",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 0 40px rgba(52,211,153,.05)",
          }}
        >
          {/* Top accent line */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(to right,transparent,rgba(52,211,153,.4),transparent)",
            }}
          />

          <div style={{ padding: "32px 28px" }}>
            <ThemePanel />
          </div>
        </div>
      </div>
    </>
  );
}
