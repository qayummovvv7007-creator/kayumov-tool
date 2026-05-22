// app/(dashboard)/layout.jsx
// Virtual OS shell — taskbar, sidebar va window area

"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Taskbar from "@/components/os/Taskbar";
import InviteNotification from "@/components/games/InviteNotification";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-mono">
            Initializing system...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Fon nuqtali grid effekti */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Asosiy kontent maydoni */}
      <main className="flex-1 overflow-auto pb-16 relative z-10">
        {children}
      </main>

      {/* Virtual OS Taskbar — pastda */}
      <Taskbar />

      {/* O'yin takliflari uchun global notification overlay */}
      <InviteNotification />
    </div>
  );
}
