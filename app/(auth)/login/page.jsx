"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const [focus, setFocus] = useState("");

  // Blinking cursor for title
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 530);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(form.email, form.password);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes gridScroll { from{background-position:0 0} to{background-position:0 40px} }
        @keyframes scanline   { from{top:-5%} to{top:105%} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes glitch1    { 0%,100%{clip-path:inset(0 0 98% 0)} 25%{clip-path:inset(30% 0 50% 0)} 50%{clip-path:inset(60% 0 10% 0)} 75%{clip-path:inset(10% 0 80% 0)} }
        @keyframes shake      { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }

        .login-input {
          width: 100%; padding: 12px 16px;
          background: rgba(7,15,30,0.9);
          border: 1px solid rgba(148,163,184,0.15);
          border-radius: 10px;
          font-family: monospace; font-size: 14px;
          color: #f1f5f9;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: #334155; }
        .login-input:focus {
          border-color: var(--accent-color, #38bdf8);
          box-shadow: 0 0 0 3px rgba(56,189,248,.1), inset 0 0 20px rgba(56,189,248,.04);
        }
        .login-btn {
          width: 100%; padding: 13px;
          background: var(--accent-color, #38bdf8);
          border: none; border-radius: 10px;
          font-family: monospace; font-size: 14px; font-weight: 700;
          color: #020c1b; cursor: pointer; letter-spacing: .06em;
          transition: all .2s;
          position: relative; overflow: hidden;
        }
        .login-btn:not(:disabled):hover { filter: brightness(1.15); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(56,189,248,.3); }
        .login-btn:disabled { opacity: .5; cursor: not-allowed; }
        .login-btn::after {
          content:""; position:absolute; inset:0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.2) 50%, transparent 60%);
          transform: translateX(-100%); transition: transform .4s;
        }
        .login-btn:not(:disabled):hover::after { transform: translateX(100%); }
        .error-shake { animation: shake .4s ease; }
      `}</style>

      {/* Animated grid bg */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(56,189,248,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,.04) 1px,transparent 1px)`,
          backgroundSize: "40px 40px",
          animation: "gridScroll 4s linear infinite",
        }}
      />

      {/* Scanline */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          height: 2,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(to right,transparent,rgba(56,189,248,.1),transparent)",
          animation: "scanline 7s linear infinite",
        }}
      />

      {/* Center content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            animation: "fadeUp .5s ease both",
          }}
        >
          {/* Card */}
          <div
            style={{
              background: "rgba(10,20,38,0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(56,189,248,.15)",
              borderRadius: 20,
              padding: "40px 36px",
              boxShadow:
                "0 0 60px rgba(56,189,248,.06), inset 0 0 60px rgba(0,0,0,.2)",
            }}
          >
            {/* Logo */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div
                style={{
                  fontFamily: "monospace",
                  fontWeight: 800,
                  fontSize: 26,
                  color: "#f1f5f9",
                  letterSpacing: ".02em",
                  marginBottom: 6,
                }}
              >
                <span style={{ color: "var(--accent-color,#38bdf8)" }}>
                  kayumov
                </span>
                <span style={{ color: "#334155" }}>-</span>
                <span style={{ color: "#f1f5f9" }}>tool</span>
                <span
                  style={{
                    opacity: tick % 2 === 0 ? 1 : 0,
                    color: "var(--accent-color,#38bdf8)",
                  }}
                >
                  _
                </span>
              </div>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "#334155",
                  letterSpacing: ".1em",
                }}
              >
                // SECURE ACCESS TERMINAL
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              {/* Email */}
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "var(--accent-color,#38bdf8)",
                    opacity: focus === "email" ? 1 : 0,
                    transition: "opacity .2s",
                    letterSpacing: ".06em",
                    pointerEvents: "none",
                  }}
                >
                  EMAIL
                </span>
                <input
                  type="email"
                  placeholder="email@domain.com"
                  value={form.email}
                  className="login-input"
                  onFocus={() => setFocus("email")}
                  onBlur={() => setFocus("")}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ paddingLeft: focus === "email" ? 70 : 16 }}
                  required
                />
              </div>

              {/* Password */}
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "var(--accent-color,#38bdf8)",
                    opacity: focus === "password" ? 1 : 0,
                    transition: "opacity .2s",
                    letterSpacing: ".06em",
                    pointerEvents: "none",
                  }}
                >
                  PASS
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  className="login-input"
                  onFocus={() => setFocus("password")}
                  onBlur={() => setFocus("")}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  style={{ paddingLeft: focus === "password" ? 70 : 16 }}
                  required
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  className="error-shake"
                  style={{
                    background: "rgba(239,68,68,.08)",
                    border: "1px solid rgba(239,68,68,.25)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: "#f87171",
                    textAlign: "center",
                  }}
                >
                  ⚠ {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="login-btn"
                style={{ marginTop: 4 }}
              >
                {loading ? (
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
                      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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
                    AUTHENTICATING...
                  </span>
                ) : (
                  "SIGN IN →"
                )}
              </button>
            </form>

            {/* Footer link */}
            <p
              style={{
                textAlign: "center",
                fontFamily: "monospace",
                fontSize: 12,
                color: "#334155",
                marginTop: 24,
              }}
            >
              No account?{" "}
              <Link
                href="/signup"
                style={{
                  color: "var(--accent-color,#38bdf8)",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.textDecoration = "underline")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.textDecoration = "none")
                }
              >
                CREATE ONE
              </Link>
            </p>
          </div>

          {/* Bottom tag */}
          <p
            style={{
              textAlign: "center",
              fontFamily: "monospace",
              fontSize: 11,
              color: "#1e293b",
              marginTop: 16,
              letterSpacing: ".08em",
            }}
          >
            KAYUMOV-TOOL © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
}
