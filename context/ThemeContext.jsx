"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext(null);

const PRESET_THEMES = [
  {
    id: "default",
    name: "Obsidian",
    bgColor: "#0f172a",
    accentColor: "#3b82f6",
    gradient: "none",
  },
  {
    id: "midnight",
    name: "Midnight",
    bgColor: "#0a0a0f",
    accentColor: "#8b5cf6",
    gradient: "none",
  },
  {
    id: "forest",
    name: "Forest",
    bgColor: "#0f1f0f",
    accentColor: "#22c55e",
    gradient: "none",
  },
  {
    id: "crimson",
    name: "Crimson",
    bgColor: "#1a0a0a",
    accentColor: "#ef4444",
    gradient: "none",
  },
  {
    id: "ocean",
    name: "Ocean",
    bgColor: "#020617",
    accentColor: "#06b6d4",
    gradient: "linear-gradient(135deg, #020617 0%, #0c1a2e 50%, #0f2744 100%)",
  },
  {
    id: "aurora",
    name: "Aurora",
    bgColor: "#0a0f1a",
    accentColor: "#a78bfa",
    gradient: "linear-gradient(135deg, #0a0f1a 0%, #1a0a2e 40%, #0a1a1a 100%)",
  },
  {
    id: "sunset",
    name: "Sunset",
    bgColor: "#1a0a00",
    accentColor: "#f97316",
    gradient: "linear-gradient(135deg, #1a0a00 0%, #2d1000 50%, #1a1000 100%)",
  },
];

function ThemeProvider({ children }) {
  const { user, updateUser } = useAuth();
  const [theme, setTheme] = useState(PRESET_THEMES[0]);

  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme);
    }
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg-primary", theme.bgColor);
    root.style.setProperty("--accent-color", theme.accentColor);
    root.style.setProperty(
      "--bg-gradient",
      theme.gradient !== "none" ? theme.gradient : "none",
    );
  }, [theme]);

  const applyTheme = async (newTheme) => {
    setTheme(newTheme);
    try {
      await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      });
      updateUser({ theme: newTheme });
    } catch (err) {
      console.error("Failed to save theme:", err);
    }
  };

  return (
    <ThemeContext.Provider
      value={{ theme, applyTheme, presets: PRESET_THEMES }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

export { ThemeProvider, useTheme, PRESET_THEMES };
