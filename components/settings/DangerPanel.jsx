"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const WarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 2L18.5 17H1.5L10 2z" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(239,68,68,.1)" />
    <line x1="10" y1="8" x2="10" y2="12" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="14.5" r="0.8" fill="#ef4444" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M6 4V2h4v2M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="7" y1="7" x2="7" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="9" y1="7" x2="9" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export default function DangerPanel() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [step, setStep]         = useState(0); // 0=idle 1=confirm 2=type 3=deleting
  const [typed, setTyped]       = useState("");
  const [error, setError]       = useState("");
  const [shake, setShake]       = useState(false);

  const CONFIRM_TEXT = user?.username || "DELETE";

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleDelete = async () => {
    if (typed !== CONFIRM_TEXT) {
      triggerShake();
      setError(`Type exactly: ${CONFIRM_TEXT}`);
      return;
    }

    setStep(3);
    setError("");
    try {
      const res = await fetch("/api/users/delete", { method: "DELETE" });
      if (res.ok) {
        // Logout va login sahifasiga yuborish
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete account");
        setStep(2);
      }
    } catch {
      setError("Network error. Try again.");
      setStep(2);
    }
  };

  return (
    <>
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes spin { to{transform:rotate(360deg)} }

        .danger-btn {
          display:flex; align-items:center; justify-content:center; gap:8px;
          padding:11px 20px; border-radius:10px; font-family:monospace;
          font-size:13px; font-weight:700; letter-spacing:.08em; cursor:pointer;
          transition:all .2s; border:1px solid rgba(239,68,68,.35);
          background:rgba(239,68,68,.06); color:#f87171;
          position:relative; overflow:hidden;
        }
        .danger-btn:hover { background:rgba(239,68,68,.14); border-color:rgba(239,68,68,.6);
          box-shadow:0 0 20px rgba(239,68,68,.15); transform:translateY(-1px); }
        .danger-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }
        .danger-btn::after { content:""; position:absolute; inset:0;
          background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.06) 50%,transparent 60%);
          transform:translateX(-100%); transition:transform .4s; }
        .danger-btn:hover::after { transform:translateX(100%); }

        .cancel-btn {
          padding:10px 20px; border-radius:10px; font-family:monospace;
          font-size:13px; letter-spacing:.06em; cursor:pointer;
          background:transparent; border:1px solid rgba(148,163,184,.15);
          color:#64748b; transition:all .18s;
        }
        .cancel-btn:hover { background:rgba(148,163,184,.06); color:#94a3b8; }

        .confirm-input {
          width:100%; padding:11px 14px; border-radius:10px;
          background:rgba(7,15,30,.9); border:1px solid rgba(239,68,68,.3);
          font-family:monospace; font-size:14px; color:#f1f5f9;
          outline:none; transition:border-color .2s; box-sizing:border-box;
          letter-spacing:.06em;
        }
        .confirm-input:focus { border-color:rgba(239,68,68,.7); box-shadow:0 0 0 3px rgba(239,68,68,.08); }
        .confirm-input.shake { animation:shake .4s ease; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Warning card */}
        <div style={{
          background: "rgba(239,68,68,.04)",
          border: "1px solid rgba(239,68,68,.15)",
          borderRadius: 14, padding: "18px 20px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <WarningIcon />
            <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700,
              color: "#f87171", letterSpacing: ".04em" }}>
              DANGER ZONE
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "Your account will be permanently deleted",
              "All your messages will be removed",
              "This action cannot be undone",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%",
                  background: "#ef4444", flexShrink: 0, opacity: .7 }} />
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "#94a3b8" }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 0 — Initial button */}
        {step === 0 && (
          <div style={{ animation: "fadeUp .3s ease" }}>
            <button className="danger-btn" onClick={() => setStep(1)} style={{ width: "100%" }}>
              <TrashIcon />
              DELETE MY ACCOUNT
            </button>
          </div>
        )}

        {/* Step 1 — First confirm */}
        {step === 1 && (
          <div style={{ animation: "fadeUp .25s ease", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.2)",
              borderRadius: 12, padding: "16px 18px",
            }}>
              <p style={{ fontFamily: "monospace", fontSize: 13, color: "#fca5a5",
                margin: "0 0 4px", fontWeight: 700 }}>
                Are you absolutely sure?
              </p>
              <p style={{ fontFamily: "monospace", fontSize: 12, color: "#64748b", margin: 0 }}>
                Deleting <span style={{ color: "#f87171" }}>{user?.username}</span>'s account is permanent.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="cancel-btn" onClick={() => setStep(0)} style={{ flex: 1 }}>
                CANCEL
              </button>
              <button className="danger-btn" onClick={() => setStep(2)} style={{ flex: 1 }}>
                YES, CONTINUE
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Type username to confirm */}
        {step === 2 && (
          <div style={{ animation: "fadeUp .25s ease", display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <p style={{ fontFamily: "monospace", fontSize: 12, color: "#64748b",
                margin: "0 0 8px", letterSpacing: ".04em" }}>
                Type <span style={{
                  color: "#f87171", background: "rgba(239,68,68,.1)",
                  padding: "1px 6px", borderRadius: 4,
                }}>{CONFIRM_TEXT}</span> to confirm:
              </p>
              <input
                className={`confirm-input ${shake ? "shake" : ""}`}
                placeholder={CONFIRM_TEXT}
                value={typed}
                onChange={e => { setTyped(e.target.value); setError(""); }}
                autoFocus
                spellCheck={false}
              />
              {error && (
                <p style={{ fontFamily: "monospace", fontSize: 11, color: "#f87171",
                  margin: "6px 0 0", letterSpacing: ".04em" }}>
                  ⚠ {error}
                </p>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, borderRadius: 99, background: "rgba(239,68,68,.1)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: typed === CONFIRM_TEXT ? "#ef4444" : "rgba(239,68,68,.3)",
                width: `${Math.min((typed.length / CONFIRM_TEXT.length) * 100, 100)}%`,
                transition: "width .2s, background .3s",
                boxShadow: typed === CONFIRM_TEXT ? "0 0 8px #ef4444" : "none",
              }} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="cancel-btn" onClick={() => { setStep(0); setTyped(""); setError(""); }}
                style={{ flex: 1 }}>
                CANCEL
              </button>
              <button className="danger-btn" onClick={handleDelete}
                disabled={typed !== CONFIRM_TEXT}
                style={{ flex: 1, opacity: typed !== CONFIRM_TEXT ? .4 : 1 }}>
                <TrashIcon />
                DELETE FOREVER
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Deleting... */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            gap: 14, padding: "24px 0", animation: "fadeUp .3s ease" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"
              style={{ animation: "spin 1s linear infinite" }}>
              <circle cx="14" cy="14" r="11" stroke="#ef4444" strokeWidth="2.5"
                strokeDasharray="40" strokeDashoffset="15" opacity=".8" />
            </svg>
            <p style={{ fontFamily: "monospace", fontSize: 13, color: "#f87171",
              margin: 0, animation: "pulse 1.5s infinite", letterSpacing: ".06em" }}>
              DELETING ACCOUNT...
            </p>
          </div>
        )}
      </div>
    </>
  );
}