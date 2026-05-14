import { useState, useEffect, useCallback } from "react";

const API_URL = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

export function useAuth() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // Check if we already have a valid session
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/session`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  async function login(auth_string, password) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credentials: { auth_string, password } }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.message || "Login failed");
    }

    const data = await res.json();
    setUser(data);
    return data;
  }

  async function logout() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    setUser(null);
  }

  return { user, checking, login, logout };
}
