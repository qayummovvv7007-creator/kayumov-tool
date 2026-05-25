"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

// ── Icons ─────────────────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
    <path d="M1.5 13.5c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="2.5" y="6.5" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M4.5 6.5V4.5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="7.5" cy="10" r="1" fill="currentColor" />
  </svg>
);
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1.5" y="3.5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M1.5 5l6 4 6-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const EyeIcon = ({ show }) => show ? (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M1 7.5C1 7.5 3.5 3 7.5 3s6.5 4.5 6.5 4.5S11.5 12 7.5 12 1 7.5 1 7.5z" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="7.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.3" />
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2 2l11 11M6.2 4.2A5.5 5.5 0 017.5 4C11.5 4 14 7.5 14 7.5s-.8 1.4-2.2 2.6M4.5 5.5C2.8 6.5 1 7.5 1 7.5S3.5 11 7.5 11c.9 0 1.7-.2 2.4-.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2 6.5l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Reusable input ────────────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, error, success, hint, rightEl }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", letterSpacing: ".1em" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "10px 14px",
            paddingRight: rightEl ? 42 : 14,
            background: "rgba(7,15,30,.85)",
            border: `1px solid ${error ? "rgba(239,68,68,.4)" : success ? "rgba(34,197,94,.4)" : "rgba(148,163,184,.15)"}`,
            borderRadius: 10, fontFamily: "monospace", fontSize: 13,
            color: "#f1f5f9", outline: "none", boxSizing: "border-box",
            transition: "border-color .2s, box-shadow .2s",
          }}
          onFocus={e => e.target.style.borderColor = "var(--accent-color,#38bdf8)"}
          onBlur={e => e.target.style.borderColor = error ? "rgba(239,68,68,.4)" : success ? "rgba(34,197,94,.4)" : "rgba(148,163,184,.15)"}
        />
        {rightEl && (
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            {rightEl}
          </div>
        )}
      </div>
      {error && <p style={{ fontFamily: "monospace", fontSize: 11, color: "#f87171", margin: 0 }}>⚠ {error}</p>}
      {hint && !error && <p style={{ fontFamily: "monospace", fontSize: 11, color: "#475569", margin: 0 }}>{hint}</p>}
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function Section({ title, icon, children, color = "var(--accent-color,#38bdf8)" }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: `1px solid ${open ? color + "30" : "rgba(148,163,184,.1)"}`,
      borderRadius: 14, overflow: "hidden",
      transition: "border-color .2s",
    }}>
      <button onClick={() => setOpen(p => !p)}
        style={{
          width: "100%", padding: "14px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: open ? `${color}08` : "rgba(7,15,30,.6)",
          border: "none", cursor: "pointer", transition: "background .2s",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10,
          fontFamily: "monospace", fontSize: 13, fontWeight: 700,
          color: open ? color : "#94a3b8", letterSpacing: ".04em" }}>
          <span style={{ color: open ? color : "#64748b" }}>{icon}</span>
          {title}
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s",
            color: open ? color : "#475569" }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: "18px 18px 20px", borderTop: `1px solid ${color}15`,
          background: "rgba(5,10,22,.5)", animation: "sectionIn .2s ease" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Save button ───────────────────────────────────────────────────────────────
function SaveBtn({ onClick, loading, saved, disabled, label = "SAVE CHANGES" }) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      style={{
        width: "100%", padding: "11px", borderRadius: 10,
        border: saved ? "1px solid rgba(34,197,94,.3)" : "none",
        background: saved ? "rgba(34,197,94,.1)" : "var(--accent-color,#38bdf8)",
        color: saved ? "#22c55e" : "#020c1b",
        fontFamily: "monospace", fontSize: 13, fontWeight: 700,
        letterSpacing: ".08em", cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled && !loading ? .45 : 1,
        transition: "all .2s", marginTop: 16,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
      {loading ? (
        <>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
            style={{ animation: "spin 1s linear infinite" }}>
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="2"
              strokeDasharray="18" strokeDashoffset="6" />
          </svg>
          SAVING...
        </>
      ) : saved ? (
        <><CheckIcon /> SAVED!</>
      ) : label}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProfilePanel() {
  const { user, updateUser } = useAuth();

  // Username state
  const [username, setUsername]     = useState(user?.username || "");
  const [uPassword, setUPassword]   = useState("");
  const [uError, setUError]         = useState("");
  const [uLoading, setULoading]     = useState(false);
  const [uSaved, setUSaved]         = useState(false);

  // Password state
  const [oldPass, setOldPass]       = useState("");
  const [newPass, setNewPass]       = useState("");
  const [confPass, setConfPass]     = useState("");
  const [showOld, setShowOld]       = useState(false);
  const [showNew, setShowNew]       = useState(false);
  const [pError, setPError]         = useState("");
  const [pLoading, setPLoading]     = useState(false);
  const [pSaved, setPSaved]         = useState(false);

  // Email state
  const [email, setEmail]           = useState(user?.email || "");
  const [ePassword, setEPassword]   = useState("");
  const [showEPass, setShowEPass]   = useState(false);
  const [eError, setEError]         = useState("");
  const [eLoading, setELoading]     = useState(false);
  const [eSaved, setESaved]         = useState(false);

  const accent = "var(--accent-color,#38bdf8)";

  // ── Password strength ──
  const passStrength = (p) => {
    if (!p) return { score: 0, label: "", color: "" };
    let s = 0;
    if (p.length >= 8)  s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    const map = [
      { label: "Too short", color: "#ef4444" },
      { label: "Weak",      color: "#f97316" },
      { label: "Fair",      color: "#eab308" },
      { label: "Good",      color: "#22c55e" },
      { label: "Strong",    color: "#38bdf8" },
    ];
    return { score: s, ...map[s] };
  };
  const strength = passStrength(newPass);

  // ── Save username ──
  const saveUsername = async () => {
    setUError("");
    if (!username.trim()) return setUError("Username cannot be empty");
    if (username === user?.username) return setUError("Same as current username");
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return setUError("Only letters, numbers, underscores");
    if (username.length < 3) return setUError("Min 3 characters");
    if (username.length > 20) return setUError("Max 20 characters");
    if (!uPassword) return setUError("Current password required");

    setULoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, currentPassword: uPassword, type: "username" }),
      });
      const data = await res.json();
      if (!res.ok) { setUError(data.error || "Failed"); return; }
      updateUser({ username: data.user.username });
      setUPassword("");
      setUSaved(true);
      setTimeout(() => setUSaved(false), 2500);
    } catch { setUError("Network error"); }
    finally { setULoading(false); }
  };

  // ── Save password ──
  const savePassword = async () => {
    setPError("");
    if (!oldPass) return setPError("Current password required");
    if (!newPass) return setPError("New password required");
    if (newPass.length < 6) return setPError("Min 6 characters");
    if (newPass !== confPass) return setPError("Passwords don't match");
    if (oldPass === newPass) return setPError("Same as current password");

    setPLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: oldPass, newPassword: newPass, type: "password" }),
      });
      const data = await res.json();
      if (!res.ok) { setPError(data.error || "Failed"); return; }
      setOldPass(""); setNewPass(""); setConfPass("");
      setPSaved(true);
      setTimeout(() => setPSaved(false), 2500);
    } catch { setPError("Network error"); }
    finally { setPLoading(false); }
  };

  // ── Save email ──
  const saveEmail = async () => {
    setEError("");
    if (!email.trim()) return setEError("Email cannot be empty");
    if (email === user?.email) return setEError("Same as current email");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setEError("Invalid email format");
    if (!ePassword) return setEError("Current password required");

    setELoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, currentPassword: ePassword, type: "email" }),
      });
      const data = await res.json();
      if (!res.ok) { setEError(data.error || "Failed"); return; }
      updateUser({ email: data.user.email });
      setEPassword("");
      setESaved(true);
      setTimeout(() => setESaved(false), 2500);
    } catch { setEError("Network error"); }
    finally { setELoading(false); }
  };

  return (
    <>
      <style>{`
        @keyframes sectionIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .eye-btn { background:none; border:none; cursor:pointer; color:#64748b;
          display:flex; align-items:center; padding:0; transition:color .15s; }
        .eye-btn:hover { color:var(--accent-color,#38bdf8); }
      `}</style>

      {/* Current info */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 16px", borderRadius: 12, marginBottom: 20,
        background: "rgba(7,15,30,.6)", border: "1px solid rgba(148,163,184,.08)",
      }}>
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
          alt="" style={{ width: 44, height: 44, borderRadius: "50%",
            border: `2px solid ${accent}` }} />
        <div>
          <p style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 800,
            color: "#f1f5f9", margin: "0 0 3px" }}>{user?.username}</p>
          <p style={{ fontFamily: "monospace", fontSize: 12, color: "#475569", margin: 0 }}>
            {user?.email}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

        {/* ── Username ── */}
        <Section title="Change Username" icon={<UserIcon />} color="#38bdf8">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="NEW USERNAME" value={username}
              onChange={setUsername} placeholder="new_username"
              error={uError && uError.includes("ername") ? uError : ""}
              hint="3-20 chars, letters/numbers/underscore only" />
            <Field label="CURRENT PASSWORD" type="password" value={uPassword}
              onChange={setUPassword} placeholder="••••••••"
              error={uError && !uError.includes("ername") ? uError : ""}
              rightEl={
                <button className="eye-btn" onClick={() => {}}>
                  <LockIcon />
                </button>
              } />
            {uError && <p style={{ fontFamily:"monospace", fontSize:11, color:"#f87171", margin:0 }}>⚠ {uError}</p>}
            <SaveBtn onClick={saveUsername} loading={uLoading} saved={uSaved}
              disabled={!username || !uPassword} />
          </div>
        </Section>

        {/* ── Password ── */}
        <Section title="Change Password" icon={<LockIcon />} color="#a78bfa">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="CURRENT PASSWORD" type={showOld ? "text" : "password"}
              value={oldPass} onChange={setOldPass} placeholder="••••••••"
              rightEl={
                <button className="eye-btn" onClick={() => setShowOld(p => !p)}>
                  <EyeIcon show={showOld} />
                </button>
              } />
            <Field label="NEW PASSWORD" type={showNew ? "text" : "password"}
              value={newPass} onChange={setNewPass} placeholder="••••••••"
              hint={newPass ? `${strength.label}` : "Min 6 characters"}
              rightEl={
                <button className="eye-btn" onClick={() => setShowNew(p => !p)}>
                  <EyeIcon show={showNew} />
                </button>
              } />

            {/* Strength bar */}
            {newPass && (
              <div style={{ display: "flex", gap: 4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 99,
                    background: i <= strength.score ? strength.color : "rgba(148,163,184,.15)",
                    transition: "background .2s",
                  }} />
                ))}
              </div>
            )}

            <Field label="CONFIRM PASSWORD" type="password"
              value={confPass} onChange={setConfPass} placeholder="••••••••"
              error={confPass && confPass !== newPass ? "Passwords don't match" : ""}
              success={confPass && confPass === newPass} />

            {pError && <p style={{ fontFamily:"monospace", fontSize:11, color:"#f87171", margin:0 }}>⚠ {pError}</p>}
            <SaveBtn onClick={savePassword} loading={pLoading} saved={pSaved}
              disabled={!oldPass || !newPass || !confPass || newPass !== confPass}
              label="CHANGE PASSWORD" />
          </div>
        </Section>

        {/* ── Email ── */}
        <Section title="Change Email" icon={<MailIcon />} color="#34d399">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="NEW EMAIL" type="email" value={email}
              onChange={setEmail} placeholder="new@email.com"
              hint="Must be a valid email address" />

            <Field label="CURRENT PASSWORD" type={showEPass ? "text" : "password"}
              value={ePassword} onChange={setEPassword} placeholder="••••••••"
              rightEl={
                <button className="eye-btn" onClick={() => setShowEPass(p => !p)}>
                  <EyeIcon show={showEPass} />
                </button>
              } />

            {eError && <p style={{ fontFamily:"monospace", fontSize:11, color:"#f87171", margin:0 }}>⚠ {eError}</p>}
            <SaveBtn onClick={saveEmail} loading={eLoading} saved={eSaved}
              disabled={!email || !ePassword}
              label="CHANGE EMAIL" />
          </div>
        </Section>
      </div>
    </>
  );
}