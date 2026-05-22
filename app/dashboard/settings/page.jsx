"use client";
import ThemePanel from "@/components/settings/ThemePanel";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-mono font-bold mb-8">System Settings</h1>
      <ThemePanel />
    </div>
  );
}
