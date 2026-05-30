"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every(Boolean)) return { winner: "draw" };
  return null;
}

export default function TicTacToe({
  onClose,
  gameRoom,
  players,
  isMultiplayer,
}) {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [result, setResult] = useState(null);
  const [winLine, setWinLine] = useState([]);
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const [animCell, setAnimCell] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [waiting, setWaiting] = useState(isMultiplayer);

  const myId = String(user?.id || user?._id);

  // Multiplayer da: men kim? X yoki O?
  // players[0] = X (host/taklif yuborgan), players[1] = O (guest/qabul qilgan)
  const mySymbol = players
    ? String(players[0]?.userId) === myId
      ? "X"
      : "O"
    : "X"; // solo da har doim X

  const xColor = "#38bdf8";
  const oColor = "#f97316";
  const currentColor = isXTurn ? xColor : oColor;

  // Mening navbatim?
  const isMyTurn = isMultiplayer
    ? (isXTurn && mySymbol === "X") || (!isXTurn && mySymbol === "O")
    : true; // solo da har doim o'ynash mumkin

  // ── Socket — multiplayer uchun ──────────────────────────────────────────
  useEffect(() => {
    if (!socket || !isMultiplayer) return;

    // Boshqa o'yinchi ulandi — o'yin boshlash mumkin
    const handleReady = () => setWaiting(false);

    // Boshqa o'yinchi qadamini qabul qilish
    const handleMove = ({ index, symbol, board: newBoard }) => {
      setBoard(newBoard);
      setIsXTurn(symbol === "X" ? false : true);
      setAnimCell(index);
      setTimeout(() => setAnimCell(null), 400);

      const r = checkWinner(newBoard);
      if (r) {
        setResult(r);
        if (r.line) setWinLine(r.line);
        if (r.winner === "X") setScores((s) => ({ ...s, X: s.X + 1 }));
        else if (r.winner === "O") setScores((s) => ({ ...s, O: s.O + 1 }));
        else setScores((s) => ({ ...s, draw: s.draw + 1 }));
      }
    };

    // Boshqa o'yinchi reset qildi
    const handleReset = () => {
      setBoard(Array(9).fill(null));
      setIsXTurn(true);
      setResult(null);
      setWinLine([]);
    };

    // Boshqa o'yinchi chiqib ketdi
    const handleOpponentLeft = () => {
      setWaiting(true);
    };

    socket.on("ttt:ready", handleReady);
    socket.on("ttt:move", handleMove);
    socket.on("ttt:reset", handleReset);
    socket.on("ttt:opponent-left", handleOpponentLeft);

    // O'yinga kirganligimizni server ga xabar berish
    if (gameRoom) {
      socket.emit("ttt:join", { gameRoom });
    }

    return () => {
      socket.off("ttt:ready", handleReady);
      socket.off("ttt:move", handleMove);
      socket.off("ttt:reset", handleReset);
      socket.off("ttt:opponent-left", handleOpponentLeft);
    };
  }, [socket, gameRoom, isMultiplayer]);

  // Waiting ni 1 soniyadan keyin o'chirish (hozircha test uchun)
  useEffect(() => {
    if (!isMultiplayer) return;
    const t = setTimeout(() => setWaiting(false), 1500);
    return () => clearTimeout(t);
  }, [isMultiplayer]);

  // ── Qadamni bajarish ────────────────────────────────────────────────────
  const handleClick = (i) => {
    if (board[i] || result || !isMyTurn) return;

    const symbol = mySymbol;
    const newBoard = [...board];
    newBoard[i] = symbol;

    setBoard(newBoard);
    setIsXTurn(!isXTurn);
    setAnimCell(i);
    setTimeout(() => setAnimCell(null), 400);

    const r = checkWinner(newBoard);
    if (r) {
      setResult(r);
      if (r.line) setWinLine(r.line);
      if (r.winner === "X") setScores((s) => ({ ...s, X: s.X + 1 }));
      else if (r.winner === "O") setScores((s) => ({ ...s, O: s.O + 1 }));
      else setScores((s) => ({ ...s, draw: s.draw + 1 }));
    }

    // Multiplayer — boshqa o'yinchiga yuborish
    if (isMultiplayer && socket && gameRoom) {
      socket.emit("ttt:move", {
        gameRoom,
        index: i,
        symbol,
        board: newBoard,
      });
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────────
  const reset = () => {
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
    setResult(null);
    setWinLine([]);

    if (isMultiplayer && socket && gameRoom) {
      socket.emit("ttt:reset", { gameRoom });
    }
  };

  // ── Opponent info ───────────────────────────────────────────────────────
  const myPlayer = players?.find((p) => String(p.userId) === myId);
  const opponentPlayer = players?.find((p) => String(p.userId) !== myId);

  return (
    <>
      <style>{`
        @keyframes cellPop {
          0%   { transform: scale(0) rotate(-180deg); opacity:0; }
          60%  { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0); opacity:1; }
        }
        @keyframes winPulse {
          0%,100% { box-shadow: 0 0 0px transparent; }
          50%     { box-shadow: 0 0 24px currentColor; }
        }
        @keyframes resultIn {
          from { opacity:0; transform: scale(.7) translateY(20px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
        @keyframes boardIn {
          from { opacity:0; transform: scale(.9); }
          to   { opacity:1; transform: scale(1); }
        }
        @keyframes dotBlink {
          0%,100%{opacity:1} 50%{opacity:0.2}
        }
        @keyframes waitingPulse {
          0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.02)}
        }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 20px",
          position: "relative",
          fontFamily: "monospace",
          animation: "boardIn .4s cubic-bezier(0.16,1,0.3,1)",
          minWidth: 340,
        }}
      >
        {/* Header */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <h2
              style={{
                color: "#f1f5f9",
                fontWeight: 800,
                fontSize: 18,
                margin: 0,
              }}
            >
              Tic<span style={{ color: xColor }}>Tac</span>Toe
            </h2>
            {isMultiplayer && (
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "rgba(56,189,248,0.5)",
                  margin: "2px 0 0",
                  letterSpacing: ".06em",
                }}
              >
                MULTIPLAYER • You are{" "}
                <span
                  style={{
                    color: mySymbol === "X" ? xColor : oColor,
                    fontWeight: 700,
                  }}
                >
                  {mySymbol}
                </span>
              </p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: 8,
                width: 28,
                height: 28,
                color: "#64748b",
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Multiplayer players info */}
        {isMultiplayer && players && (
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
              padding: "10px 14px",
              background: "rgba(15,25,48,0.6)",
              border: "1px solid rgba(56,189,248,0.1)",
              borderRadius: 12,
            }}
          >
            {/* X player */}
            <div
              style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}
            >
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${players[0]?.username}`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: `2px solid ${xColor}`,
                }}
              />
              <div>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    color: xColor,
                    margin: 0,
                  }}
                >
                  {players[0]?.username}
                  {String(players[0]?.userId) === myId && " (you)"}
                </p>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    color: "rgba(56,189,248,0.5)",
                    margin: 0,
                  }}
                >
                  plays X
                </p>
              </div>
            </div>

            <span
              style={{
                fontFamily: "monospace",
                fontSize: 14,
                fontWeight: 800,
                color: "#334155",
              }}
            >
              VS
            </span>

            {/* O player */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                justifyContent: "flex-end",
              }}
            >
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    color: oColor,
                    margin: 0,
                  }}
                >
                  {players[1]?.username}
                  {String(players[1]?.userId) === myId && " (you)"}
                </p>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    color: "rgba(249,115,22,0.5)",
                    margin: 0,
                  }}
                >
                  plays O
                </p>
              </div>
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${players[1]?.username}`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: `2px solid ${oColor}`,
                }}
              />
            </div>
          </div>
        )}

        {/* Score board */}
        <div
          style={{ display: "flex", gap: 10, marginBottom: 20, width: "100%" }}
        >
          {[
            { label: "X", count: scores.X, color: xColor },
            { label: "DRAW", count: scores.draw, color: "#64748b" },
            { label: "O", count: scores.O, color: oColor },
          ].map(({ label, count, color }) => (
            <div
              key={label}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "8px 6px",
                background: `${color}10`,
                border: `1px solid ${color}25`,
                borderRadius: 10,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800, color }}>
                {count}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: `${color}90`,
                  letterSpacing: ".06em",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Turn / Waiting indicator */}
        {waiting ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
              padding: "8px 16px",
              background: "rgba(56,189,248,0.06)",
              border: "1px solid rgba(56,189,248,0.2)",
              borderRadius: 99,
              animation: "waitingPulse 1.5s infinite",
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#38bdf8",
                  display: "inline-block",
                  animation: `dotBlink 1s ${i * 0.3}s infinite`,
                }}
              />
            ))}
            <span
              style={{ fontSize: 11, color: "#38bdf8", letterSpacing: ".08em" }}
            >
              Waiting for opponent...
            </span>
          </div>
        ) : (
          !result && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
                padding: "8px 16px",
                background: `${currentColor}12`,
                border: `1px solid ${currentColor}30`,
                borderRadius: 99,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: currentColor,
                  boxShadow: `0 0 8px ${currentColor}`,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: currentColor,
                  letterSpacing: ".08em",
                  fontWeight: 700,
                }}
              >
                {isMyTurn ? "YOUR TURN" : "OPPONENT'S TURN"} (
                {isXTurn ? "X" : "O"})
              </span>
            </div>
          )
        )}

        {/* Board */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginBottom: 20,
            background: "rgba(15,25,48,0.6)",
            padding: 10,
            borderRadius: 20,
            border: "1px solid rgba(56,189,248,0.1)",
            opacity: waiting ? 0.4 : 1,
            transition: "opacity .3s",
          }}
        >
          {board.map((cell, i) => {
            const isWinCell = winLine.includes(i);
            const cellColor = cell === "X" ? xColor : oColor;
            const isHovered =
              hovered === i && !cell && !result && isMyTurn && !waiting;
            const canClick = !cell && !result && isMyTurn && !waiting;

            return (
              <div
                key={i}
                onClick={() => canClick && handleClick(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: canClick ? "pointer" : "default",
                  background: isWinCell
                    ? `${cellColor}20`
                    : isHovered
                      ? `${currentColor}08`
                      : "rgba(7,15,30,0.8)",
                  border: `2px solid ${
                    isWinCell
                      ? cellColor + "60"
                      : isHovered
                        ? currentColor + "30"
                        : "rgba(56,189,248,0.08)"
                  }`,
                  transition: "all .15s",
                  boxShadow: isWinCell ? `0 0 20px ${cellColor}30` : "none",
                }}
              >
                {cell && (
                  <span
                    style={{
                      fontSize: 34,
                      fontWeight: 900,
                      color: cellColor,
                      textShadow: `0 0 20px ${cellColor}80`,
                      animation:
                        animCell === i
                          ? "cellPop .4s cubic-bezier(0.16,1,0.3,1)"
                          : "none",
                      display: "block",
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    {cell}
                  </span>
                )}
                {isHovered && !cell && (
                  <span
                    style={{
                      fontSize: 34,
                      fontWeight: 900,
                      color: `${currentColor}25`,
                      display: "block",
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    {mySymbol}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Result */}
        {result && (
          <div
            style={{
              textAlign: "center",
              marginBottom: 16,
              animation: "resultIn .5s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {result.winner === "draw" ? (
              <>
                <div style={{ fontSize: 44, marginBottom: 6 }}>🤝</div>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#94a3b8",
                    margin: 0,
                  }}
                >
                  DRAW!
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: 44, marginBottom: 6 }}>
                  {result.winner === mySymbol ? "🏆" : "😔"}
                </div>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    margin: 0,
                    color: result.winner === "X" ? xColor : oColor,
                  }}
                >
                  {isMultiplayer
                    ? result.winner === mySymbol
                      ? "YOU WIN!"
                      : "YOU LOSE!"
                    : `${result.winner} WINS!`}
                </p>
              </>
            )}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            onClick={reset}
            style={{
              flex: 1,
              padding: "11px",
              background: "linear-gradient(135deg, #38bdf8, #2563eb)",
              border: "none",
              borderRadius: 12,
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 700,
              color: "white",
              cursor: "pointer",
              letterSpacing: ".06em",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.filter = "brightness(1.15)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.filter = "brightness(1)")
            }
          >
            {result ? "▶ PLAY AGAIN" : "↺ RESET"}
          </button>
        </div>
      </div>
    </>
  );
}
