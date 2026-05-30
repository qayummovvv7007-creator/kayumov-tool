"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Taskbar from "@/components/os/Taskbar";
import InviteNotification from "@/components/games/InviteNotification";
import MessageNotification from "@/components/chat/MessageNotification"; // ✅

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
      <div
        style={{ backgroundColor: "var(--bg-primary)" }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div
            style={{ borderColor: "var(--accent-color)" }}
            className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin"
          />
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
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <main className="flex-1 overflow-auto pb-16 relative z-10">
        {children}
      </main>
      <Taskbar />
      <InviteNotification />
      <MessageNotification /> {/* ✅ */}
    </div>
  );
}
