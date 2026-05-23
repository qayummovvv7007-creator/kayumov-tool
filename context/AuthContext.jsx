"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const text = await res.text();

      if (!text || text.trim() === "") {
        setUser(null);
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setUser(null);
        return;
      }

      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      if (!text) return { success: false, error: "Empty response" };

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return { success: false, error: "Invalid server response" };
      }

      if (res.ok && data.user) {
        setUser(data.user);
        router.push("/");
        return { success: true };
      }
      return { success: false, error: data.error || "Login failed" };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const signup = async (username, email, password) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const text = await res.text();
      if (!text) return { success: false, error: "Empty response" };

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return { success: false, error: "Invalid server response" };
      }

      if (res.ok && data.user) {
        setUser(data.user);
        router.push("/");
        return { success: true };
      }
      return { success: false, error: data.error || "Signup failed" };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    router.push("/login");
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, updateUser, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export { AuthProvider, useAuth };
