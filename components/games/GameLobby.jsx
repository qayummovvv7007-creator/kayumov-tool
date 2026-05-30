"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import TicTacToe from "./TicTacToe";

const GAMES = [
  {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    desc: "Classic 3x3 duel",
    icon: "⭕",
    color: "#38bdf8",
    players: "2P",
    status: "available",
    component: TicTacToe,
  },
  {
    id: "memory-cards",
    name: "Memory Cards",
    desc: "Find matching pairs",
    icon: "🃏",
    color: "#a78bfa",
    players: "1-2P",
    status: "soon",
    component: null,
  },
  {
    id: "snake",
    name: "Snake",
    desc: "Classic snake game",
    icon: "🐍",
    color: "#22c55e",
    players: "1P",
    status: "soon",
    component: null,
  },
  {
    id: "pong",
    name: "Pong",
    desc: "Retro ping-pong",
    icon: "🏓",
    color: "#f97316",
    players: "2P",
    status: "soon",
    component: null,
  },
  {
    id: "chess",
    name: "Chess",
    desc: "Strategic battle",
    icon: "♟️",
    color: "#e2e8f0",
    players: "2P",
    status: "soon",
    component: null,
  },
  {
    id: "checkers",
    name: "Checkers",
    desc: "Board game classic",
    icon: "🔴",
    color: "#ef4444",
    players: "2P",
    status: "soon",
    component: null,
  },
];

function PlayerCard({ u, isMe, onInvite, selectedGame, sentInvites }) {
  const avatar =
    u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`;
  const hasSent = sentInvites?.has(u.userId);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: isMe ? "rgba(56,189,248,0.08)" : "rgba(15,25,48,0.6)",
        border: `1px solid ${isMe ? "rgba(56,189,248,0.2)" : "rgba(56,189,248,0.06)"}`,
        transition: "all .15s",
        marginBottom: 6,
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={avatar}
          alt={u.username}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: `2px solid ${isMe ? "#38bdf8" : "rgba(56,189,248,0.2)"}`,
          }}
        />
        <span
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "#22c55e",
            border: "2px solid #070f1e",
            boxShadow: "0 0 6px #22c55e",
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            fontWeight: 700,
            color: isMe ? "#38bdf8" : "#f1f5f9",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {u.username}
          {isMe ? " (you)" : ""}
        </p>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "#22c55e",
            margin: 0,
          }}
        >
          ● online
        </p>
      </div>

      {!isMe && selectedGame && selectedGame.status === "available" && (
        <button
          onClick={() => onInvite(u.userId)}
          disabled={hasSent}
          style={{
            padding: "5px 10px",
            background: hasSent
              ? "rgba(34,197,94,0.1)"
              : "rgba(56,189,248,0.12)",
            border: `1px solid ${hasSent ? "rgba(34,197,94,0.3)" : "rgba(56,189,248,0.3)"}`,
            borderRadius: 8,
            fontFamily: "monospace",
            fontSize: 10,
            fontWeight: 700,
            color: hasSent ? "#22c55e" : "#38bdf8",
            cursor: hasSent ? "default" : "pointer",
            whiteSpace: "nowrap",
            letterSpacing: ".04em",
            transition: "all .15s",
            flexShrink: 0,
          }}
        >
          {hasSent ? "✓ SENT" : "INVITE →"}
        </button>
      )}
    </div>
  );
}

function GameCardItem({ game, isSelected, onSelect, isPlaying }) {
  const isSoon = game.status === "soon";
  return (
    <div
      onClick={() => !isSoon && onSelect(game)}
      style={{
        padding: "14px 16px",
        borderRadius: 14,
        cursor: isSoon ? "not-allowed" : "pointer",
        background: isSelected ? `${game.color}15` : "rgba(15,25,48,0.7)",
        border: `1px solid ${isSelected ? game.color + "50" : "rgba(56,189,248,0.08)"}`,
        opacity: isSoon ? 0.5 : 1,
        transition: "all .18s",
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        gap: 12,
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!isSoon) {
          e.currentTarget.style.borderColor = game.color + "40";
          e.currentTarget.style.transform = "translateX(3px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isSelected
          ? game.color + "50"
          : "rgba(56,189,248,0.08)";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      {isSelected && (
        <div
          style={{
            position: "absolute",
            right: -20,
            top: "50%",
            transform: "translateY(-50%)",
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${game.color}30, transparent)`,
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          flexShrink: 0,
          background: `${game.color}15`,
          border: `1px solid ${game.color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
      >
        {game.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 2,
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: 13,
              color: "#f1f5f9",
            }}
          >
            {game.name}
          </span>
          {isSoon && (
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                color: "#64748b",
                padding: "1px 6px",
                borderRadius: 99,
                background: "rgba(100,116,139,0.1)",
                border: "1px solid rgba(100,116,139,0.2)",
              }}
            >
              SOON
            </span>
          )}
          {isPlaying && (
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                color: "#22c55e",
                padding: "1px 6px",
                borderRadius: 99,
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              PLAYING
            </span>
          )}
        </div>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "rgba(148,163,184,0.5)",
          }}
        >
          {game.desc}
        </span>
      </div>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: game.color,
          padding: "3px 8px",
          borderRadius: 99,
          background: `${game.color}12`,
          border: `1px solid ${game.color}25`,
          flexShrink: 0,
        }}
      >
        {game.players}
      </span>
    </div>
  );
}

function GameStartBanner({ gameData, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes bannerIn { 0%{opacity:0;transform:scale(0.3) rotate(-10deg)} 60%{transform:scale(1.08) rotate(2deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
        @keyframes starBurst { 0%{transform:scale(0) rotate(0);opacity:1} 100%{transform:scale(2.5) rotate(180deg);opacity:0} }
        @keyframes vsWobble { 0%,100%{transform:scale(1) rotate(-3deg)} 50%{transform:scale(1.15) rotate(3deg)} }
        @keyframes textShimmer2 { 0%{background-position:-200% center} 100%{background-position:200% center} }
      `}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 300 * i,
              height: 300 * i,
              borderRadius: "50%",
              border: `2px solid rgba(56,189,248,${0.3 / i})`,
              animation: `starBurst 1.5s ${i * 0.2}s ease-out both`,
            }}
          />
        ))}
        <div
          style={{
            textAlign: "center",
            animation: "bannerIn .6s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div style={{ fontSize: 72, marginBottom: 16, lineHeight: 1 }}>
            {GAMES.find((g) => g.id === gameData?.gameId)?.icon || "🎮"}
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontWeight: 900,
              fontSize: 42,
              letterSpacing: ".15em",
              background: "linear-gradient(135deg, #38bdf8, #a78bfa, #38bdf8)",
              backgroundSize: "200% auto",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 16,
              animation: "textShimmer2 1.5s linear infinite",
            }}
          >
            GAME START!
          </div>
          {gameData?.players && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${gameData.players[0]?.username}`}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    border: "3px solid #38bdf8",
                    boxShadow: "0 0 20px #38bdf860",
                  }}
                />
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: "#38bdf8",
                    margin: "6px 0 0",
                    fontWeight: 700,
                  }}
                >
                  {gameData.players[0]?.username}
                </p>
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontWeight: 900,
                  fontSize: 28,
                  color: "#f97316",
                  animation: "vsWobble .6s ease-in-out infinite",
                  padding: "8px 16px",
                  background: "rgba(249,115,22,0.1)",
                  border: "2px solid rgba(249,115,22,0.3)",
                  borderRadius: 12,
                }}
              >
                VS
              </div>
              <div style={{ textAlign: "center" }}>
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${gameData.players[1]?.username}`}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    border: "3px solid #a78bfa",
                    boxShadow: "0 0 20px #a78bfa60",
                  }}
                />
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: "#a78bfa",
                    margin: "6px 0 0",
                    fontWeight: 700,
                  }}
                >
                  {gameData.players[1]?.username}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main GameLobby ────────────────────────────────────────────────────────────
export default function GameLobby() {
  const { socket, onlineUsers } = useSocket();
  const { user } = useAuth();

  const [selectedGame, setSelectedGame] = useState(null);
  const [playingGame, setPlayingGame] = useState(null);
  const [sentInvites, setSentInvites] = useState(new Set());
  const [startBanner, setStartBanner] = useState(null);
  // ✅ gameSession — multiplayer uchun gameRoom va players saqlanadi
  const [gameSession, setGameSession] = useState(null);

  const myId = user?.id || user?._id;

  // ✅ game:started eventini tinglash
  useEffect(() => {
    if (!socket) return;

    const handleGameStarted = (data) => {
      // data = { gameRoom, gameId, players: [{userId, username}] }
      console.log("🎮 Game started:", data);
      setGameSession(data); // ← gameRoom va players saqlaymiz
      setStartBanner(data); // ← animatsiya ko'rsatamiz
    };

    socket.on("game:started", handleGameStarted);
    return () => socket.off("game:started", handleGameStarted);
  }, [socket]);

  // ✅ Animatsiya tugagach — o'yinni ochish
  const handleBannerDone = () => {
    if (!gameSession) return;
    const game = GAMES.find((g) => g.id === gameSession.gameId);
    if (game?.component) {
      setPlayingGame(game);
    }
    setStartBanner(null);
  };

  const handleInvite = (targetUserId) => {
    if (!socket || !selectedGame) return;
    socket.emit("game:invite", {
      targetUserId,
      gameId: selectedGame.id,
      gameName: selectedGame.name,
    });
    setSentInvites((prev) => new Set([...prev, targetUserId]));
    setTimeout(() => {
      setSentInvites((prev) => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    }, 10000);
  };

  const handleSelectGame = (game) => {
    setSelectedGame(selectedGame?.id === game.id ? null : game);
    setPlayingGame(null);
  };

  const handlePlayNow = () => {
    if (!selectedGame?.component) return;
    // Solo o'yin — gameSession yo'q
    setGameSession(null);
    setPlayingGame(selectedGame);
  };

  const handleCloseGame = () => {
    setPlayingGame(null);
    setGameSession(null);
  };

  const GameComponent = playingGame?.component;

  return (
    <>
      <style>{`
        @keyframes lobbyIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes textShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
      `}</style>

      {/* ✅ Kirish animatsiyasi */}
      {startBanner && (
        <GameStartBanner gameData={startBanner} onDone={handleBannerDone} />
      )}

      <div
        style={{
          display: "flex",
          height: "calc(100vh - 56px)",
          overflow: "hidden",
          animation: "lobbyIn .4s ease both",
          fontFamily: "monospace",
        }}
      >
        {/* ══ CHAP: Online players ══════════════════════════════════════════ */}
        <div
          style={{
            width: 240,
            flexShrink: 0,
            borderRight: "1px solid rgba(56,189,248,0.1)",
            background: "rgba(5,10,22,0.85)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 14px 10px",
              borderBottom: "1px solid rgba(56,189,248,0.08)",
            }}
          >
            <h3
              style={{
                fontFamily: "monospace",
                fontWeight: 800,
                fontSize: 13,
                color: "#f1f5f9",
                margin: "0 0 2px",
              }}
            >
              Players<span style={{ color: "#38bdf8" }}>_</span>
            </h3>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "#334155",
                margin: 0,
                letterSpacing: ".08em",
              }}
            >
              <span style={{ color: "#22c55e" }}>{onlineUsers.length}</span>{" "}
              ONLINE NOW
            </p>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {onlineUsers.map((u) => (
              <PlayerCard
                key={u.userId}
                u={u}
                isMe={String(u.userId) === String(myId)}
                onInvite={handleInvite}
                selectedGame={selectedGame}
                sentInvites={sentInvites}
              />
            ))}
            {onlineUsers.length === 0 && (
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#334155",
                  textAlign: "center",
                  padding: "20px 0",
                }}
              >
                No players online
              </p>
            )}
          </div>

          {selectedGame && (
            <div
              style={{
                padding: "12px 14px",
                borderTop: "1px solid rgba(56,189,248,0.08)",
                background: `${selectedGame.color}08`,
              }}
            >
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: selectedGame.color,
                  margin: "0 0 6px",
                  letterSpacing: ".08em",
                }}
              >
                SELECTED GAME
              </p>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#f1f5f9",
                  margin: "0 0 8px",
                }}
              >
                {selectedGame.icon} {selectedGame.name}
              </p>
              {selectedGame.component && (
                <button
                  onClick={handlePlayNow}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: `linear-gradient(135deg, ${selectedGame.color}, ${selectedGame.color}99)`,
                    border: "none",
                    borderRadius: 10,
                    fontFamily: "monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#020c1b",
                    cursor: "pointer",
                    letterSpacing: ".06em",
                  }}
                >
                  ▶ PLAY NOW (solo)
                </button>
              )}
            </div>
          )}
        </div>

        {/* ══ O'RTA: Game area ══════════════════════════════════════════════ */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {GameComponent ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(7,15,30,0.5)",
                overflow: "auto",
                padding: "20px",
              }}
            >
              <div
                style={{
                  background: "rgba(10,20,38,0.9)",
                  border: `1px solid ${playingGame.color}30`,
                  borderRadius: 24,
                  minWidth: 360,
                  boxShadow: `0 0 60px ${playingGame.color}15`,
                }}
              >
                {/* ✅ gameRoom, players, isMultiplayer uzatilmoqda */}
                <GameComponent
                  onClose={handleCloseGame}
                  gameRoom={gameSession?.gameRoom}
                  players={gameSession?.players}
                  isMultiplayer={!!gameSession}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                opacity: 0.3,
              }}
            >
              <div style={{ fontSize: 64 }}>🎮</div>
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 16,
                    color: "#94a3b8",
                    margin: "0 0 6px",
                    fontWeight: 700,
                  }}
                >
                  Select a game
                </p>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: "#475569",
                    margin: 0,
                  }}
                >
                  Choose from the right panel
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ══ O'NG: Games list ══════════════════════════════════════════════ */}
        <div
          style={{
            width: 260,
            flexShrink: 0,
            borderLeft: "1px solid rgba(56,189,248,0.1)",
            background: "rgba(5,10,22,0.85)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 14px 10px",
              borderBottom: "1px solid rgba(56,189,248,0.08)",
            }}
          >
            <h3
              style={{
                fontFamily: "monospace",
                fontWeight: 800,
                fontSize: 13,
                color: "#f1f5f9",
                margin: "0 0 2px",
              }}
            >
              Games<span style={{ color: "#a78bfa" }}>_</span>
            </h3>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "#334155",
                margin: 0,
                letterSpacing: ".08em",
              }}
            >
              {GAMES.filter((g) => g.status === "available").length} AVAILABLE
            </p>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {GAMES.map((game) => (
              <GameCardItem
                key={game.id}
                game={game}
                isSelected={selectedGame?.id === game.id}
                isPlaying={playingGame?.id === game.id}
                onSelect={handleSelectGame}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
