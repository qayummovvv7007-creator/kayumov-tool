"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass rounded-2xl p-8 border border-slate-700/50">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-mono font-bold">kayumov-tool</h1>
          <p className="text-slate-400 font-mono text-sm mt-1">
            Sign in to your system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-[var(--accent-color)] transition-all"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-[var(--accent-color)] transition-all"
            required
          />

          {error && (
            <p className="text-red-400 text-xs font-mono text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/80 text-white font-mono rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p className="text-center text-sm font-mono text-slate-400 mt-6">
          No account?{" "}
          <Link
            href="/signup"
            className="text-[var(--accent-color)] hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
