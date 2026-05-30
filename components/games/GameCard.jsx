"use client";

export default function GameCard({ game, isSelected, onSelect }) {
  const isComingSoon = game.status === "coming-soon";

  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative",
        padding: "20px",
        borderRadius: 16,
        cursor: isComingSoon ? "not-allowed" : "pointer",
        background: isSelected ? `${game.color}15` : "rgba(15,23,42,0.8)",
        border: `1px solid ${isSelected ? game.color + "60" : "rgba(148,163,184,0.1)"}`,
        transition: "all .2s ease",
        opacity: isComingSoon ? 0.5 : 1,
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!isComingSoon) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.borderColor = game.color + "40";
          e.currentTarget.style.boxShadow = `0 8px 24px ${game.color}15`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = isSelected
          ? game.color + "60"
          : "rgba(148,163,184,0.1)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Corner glow */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${game.color}20 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: `${game.color}15`,
          border: `1px solid ${game.color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          marginBottom: 14,
        }}
      >
        {game.icon}
      </div>

      {/* Info */}
      <h3
        style={{
          fontFamily: "monospace",
          fontWeight: 700,
          fontSize: 15,
          color: "#f1f5f9",
          margin: "0 0 5px",
        }}
      >
        {game.name}
      </h3>

      <p
        style={{
          fontFamily: "monospace",
          fontSize: 12,
          color: "rgba(148,163,184,0.6)",
          margin: "0 0 12px",
        }}
      >
        {game.description}
      </p>

      {/* Footer */}
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
            fontSize: 10,
            color: game.color,
            opacity: 0.8,
            padding: "3px 8px",
            background: `${game.color}12`,
            border: `1px solid ${game.color}25`,
            borderRadius: 99,
          }}
        >
          {game.players}
        </span>

        {isComingSoon ? (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#64748b",
              letterSpacing: ".05em",
            }}
          >
            SOON
          </span>
        ) : (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: isSelected ? game.color : "#475569",
              letterSpacing: ".05em",
            }}
          >
            {isSelected ? "SELECTED ✓" : "PLAY →"}
          </span>
        )}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "15%",
            right: "15%",
            height: 2,
            background: `linear-gradient(to right, transparent, ${game.color}, transparent)`,
          }}
        />
      )}
    </div>
  );
}
