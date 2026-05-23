"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function SignupPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signup(form.username, form.email, form.password);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Syne:wght@400;700;800&display=swap');
        .auth-bg{background:#060910;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;overflow:hidden;position:relative;}
        .auth-bg::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(56,189,248,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,0.03) 1px,transparent 1px);background-size:48px 48px;animation:gridMove 20s linear infinite;}
        @keyframes gridMove{0%{transform:translateY(0)}100%{transform:translateY(48px)}}
        .orb{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;}
        .orb-1{width:500px;height:500px;background:radial-gradient(circle,rgba(56,189,248,0.08) 0%,transparent 70%);top:-100px;left:-100px;animation:orbFloat1 8s ease-in-out infinite;}
        .orb-2{width:400px;height:400px;background:radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%);bottom:-50px;right:-50px;animation:orbFloat2 10s ease-in-out infinite;}
        @keyframes orbFloat1{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,30px)}}
        @keyframes orbFloat2{0%,100%{transform:translate(0,0)}50%{transform:translate(-20px,-20px)}}
        .auth-card{position:relative;z-index:10;width:100%;max-width:420px;padding:0 20px;opacity:0;transform:translateY(24px);animation:cardReveal 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s forwards;}
        @keyframes cardReveal{to{opacity:1;transform:translateY(0)}}
        .card-inner{background:rgba(8,14,26,0.9);border:1px solid rgba(56,189,248,0.12);border-radius:20px;padding:40px 36px;box-shadow:0 0 0 1px rgba(56,189,248,0.04),0 32px 64px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.04);backdrop-filter:blur(20px);}
        .logo-area{text-align:center;margin-bottom:36px;}
        .logo-icon{width:52px;height:52px;margin:0 auto 16px;border:1px solid rgba(56,189,248,0.3);border-radius:14px;display:flex;align-items:center;justify-content:center;background:rgba(56,189,248,0.06);box-shadow:0 0 20px rgba(56,189,248,0.1);font-size:22px;}
        .logo-title{font-family:'Share Tech Mono',monospace;font-size:20px;color:#f1f5f9;letter-spacing:0.05em;margin-bottom:6px;}
        .logo-title span{color:#38bdf8;}
        .logo-sub{font-family:'Share Tech Mono',monospace;font-size:11px;color:rgba(148,163,184,0.5);letter-spacing:0.15em;text-transform:uppercase;}
        .divider{display:flex;align-items:center;gap:12px;margin-bottom:28px;}
        .divider-line{flex:1;height:1px;background:rgba(56,189,248,0.08);}
        .divider-text{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(56,189,248,0.4);letter-spacing:0.2em;}
        .field-wrap{position:relative;margin-bottom:14px;opacity:0;transform:translateX(-12px);animation:fieldReveal 0.5s cubic-bezier(0.16,1,0.3,1) forwards;}
        .field-wrap:nth-child(1){animation-delay:0.2s}
        .field-wrap:nth-child(2){animation-delay:0.3s}
        .field-wrap:nth-child(3){animation-delay:0.4s}
        @keyframes fieldReveal{to{opacity:1;transform:translateX(0)}}
        .field-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:13px;color:rgba(56,189,248,0.35);font-family:monospace;pointer-events:none;transition:color 0.2s;z-index:1;}
        .field-input{width:100%;background:rgba(15,23,42,0.8);border:1px solid rgba(56,189,248,0.1);border-radius:10px;padding:13px 14px 13px 38px;font-family:'Share Tech Mono',monospace;font-size:13px;color:#e2e8f0;outline:none;transition:all 0.2s ease;box-sizing:border-box;}
        .field-input::placeholder{color:rgba(100,116,139,0.6)}
        .field-input:focus{border-color:rgba(56,189,248,0.45);background:rgba(15,23,42,1);box-shadow:0 0 0 3px rgba(56,189,248,0.07),inset 0 1px 0 rgba(56,189,248,0.04);}
        .field-wrap:focus-within .field-icon{color:rgba(56,189,248,0.8)}
        .error-box{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:8px;padding:10px 14px;margin-bottom:14px;font-family:'Share Tech Mono',monospace;font-size:12px;color:#f87171;display:flex;align-items:center;gap:8px;}
        .submit-btn{width:100%;padding:13px;background:linear-gradient(135deg,#0ea5e9 0%,#2563eb 100%);border:none;border-radius:10px;font-family:'Share Tech Mono',monospace;font-size:13px;letter-spacing:0.1em;color:white;cursor:pointer;position:relative;overflow:hidden;margin-top:6px;transition:all 0.2s;box-shadow:0 4px 20px rgba(14,165,233,0.25);}
        .submit-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.1) 0%,transparent 60%);}
        .submit-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 28px rgba(14,165,233,0.35)}
        .submit-btn:disabled{opacity:0.6;cursor:not-allowed}
        .spinner{display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:8px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .auth-footer{text-align:center;margin-top:24px;font-family:'Share Tech Mono',monospace;font-size:12px;color:rgba(100,116,139,0.7);}
        .auth-footer a{color:#38bdf8;text-decoration:none;border-bottom:1px solid rgba(56,189,248,0.3);padding-bottom:1px;transition:all 0.2s;}
        .auth-footer a:hover{color:#7dd3fc;border-color:rgba(125,211,252,0.5)}
        .corner{position:absolute;width:14px;height:14px;border-color:rgba(56,189,248,0.3);border-style:solid}
        .corner-tl{top:-1px;left:-1px;border-width:2px 0 0 2px;border-radius:4px 0 0 0}
        .corner-tr{top:-1px;right:-1px;border-width:2px 2px 0 0;border-radius:0 4px 0 0}
        .corner-bl{bottom:-1px;left:-1px;border-width:0 0 2px 2px;border-radius:0 0 0 4px}
        .corner-br{bottom:-1px;right:-1px;border-width:0 2px 2px 0;border-radius:0 0 4px 0}
        .status-bar{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;margin-top:20px;border:1px solid rgba(56,189,248,0.07);border-radius:8px;background:rgba(56,189,248,0.02)}
        .status-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 6px #22c55e;animation:pulseDot 2s ease-in-out infinite}
        @keyframes pulseDot{0%,100%{opacity:1}50%{opacity:0.4}}
        .status-text{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(100,116,139,0.6);letter-spacing:0.1em}
      `}</style>

      <div className="auth-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="auth-card">
          <div className="card-inner" style={{ position: "relative" }}>
            <div className="corner corner-tl" />
            <div className="corner corner-tr" />
            <div className="corner corner-bl" />
            <div className="corner corner-br" />

            <div className="logo-area">
              <div className="logo-icon">⬡</div>
              <div className="logo-title">
                kayumov<span>-tool</span>
              </div>
              <div className="logo-sub">Virtual OS Platform</div>
            </div>

            <div className="divider">
              <div className="divider-line" />
              <div className="divider-text">NEW ACCOUNT</div>
              <div className="divider-line" />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field-wrap">
                <input
                  type="text"
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className="field-input"
                  required
                />
                <span className="field-icon">◈</span>
              </div>
              <div className="field-wrap">
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="field-input"
                  required
                />
                <span className="field-icon">◉</span>
              </div>
              <div className="field-wrap">
                <input
                  type="password"
                  placeholder="Password — min 6 chars"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="field-input"
                  required
                />
                <span className="field-icon">◆</span>
              </div>

              {error && (
                <div className="error-box">
                  <span>⚠</span> {error}
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" />
                    CREATING...
                  </>
                ) : (
                  "INITIALIZE ACCOUNT →"
                )}
              </button>
            </form>

            <div className="status-bar">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="status-dot" />
                <span className="status-text">SYSTEM ONLINE</span>
              </div>
              <span className="status-text">v1.0.0</span>
            </div>
          </div>

          <div className="auth-footer">
            Already have an account? <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
}
