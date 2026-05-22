// components/settings/ThemePanel.jsx
// Tema sozlamalari paneli — rang va gradient tanlash

"use client";

import { useState } from "react";
import { useTheme, PRESET_THEMES } from "@/context/ThemeContext";
import { Palette, Check } from "lucide-react";

export default function ThemePanel() {
  const { theme, applyTheme } = useTheme();
  const [customBg, setCustomBg] = useState(theme.bgColor);
  const [customAccent, setCustomAccent] = useState(theme.accentColor);

  const handlePresetSelect = (preset) => {
    applyTheme(preset);
  };

  const handleCustomApply = () => {
    applyTheme({
      id: "custom",
      name: "Custom",
      bgColor: customBg,
      accentColor: customAccent,
      gradient: "none",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-mono font-semibold text-slate-300 flex items-center gap-2 mb-4">
          <Palette size={16} className="text-[var(--accent-color)]" />
          Preset Themes
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {PRESET_THEMES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={`
                relative rounded-xl overflow-hidden border-2 transition-all duration-200
                ${
                  theme.id === preset.id
                    ? "border-[var(--accent-color)] scale-[1.02]"
                    : "border-slate-700/50 hover:border-slate-600"
                }
              `}
            >
              {/* Tema preview */}
              <div
                className="h-16 w-full"
                style={{
                  background:
                    preset.gradient !== "none"
                      ? preset.gradient
                      : preset.bgColor,
                }}
              >
                {/* Accent color bar */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: preset.accentColor }}
                />
              </div>

              <div className="px-3 py-2 bg-slate-900/80 text-left">
                <p className="text-xs font-mono font-semibold text-white">
                  {preset.name}
                </p>
              </div>

              {/* Tanlangan belgi */}
              {theme.id === preset.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[var(--accent-color)] rounded-full flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom rang tanlash */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-mono font-semibold text-slate-300 mb-4">
          Custom Colors
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-2">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customBg}
                onChange={(e) => setCustomBg(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={customBg}
                onChange={(e) => setCustomBg(e.target.value)}
                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--accent-color)]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-2">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customAccent}
                onChange={(e) => setCustomAccent(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={customAccent}
                onChange={(e) => setCustomAccent(e.target.value)}
                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--accent-color)]"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleCustomApply}
          className="mt-4 w-full py-2.5 bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/40 hover:bg-[var(--accent-color)]/30 text-[var(--accent-color)] rounded-lg text-sm font-mono transition-all"
        >
          Apply Custom Theme
        </button>
      </div>
    </div>
  );
}
