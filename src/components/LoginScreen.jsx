import { useState } from "react";
import { BRAND } from "../constants/brand";

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError("");

    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: 12,
    border: "none",
    background: "#f0ede8",
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    color: BRAND.navy,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#ece8e1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ width: 420, maxWidth: "90vw" }}>

        {/* Logo card */}
        <div style={{
          background: BRAND.white,
          borderRadius: 20,
          padding: "40px 48px 36px",
          textAlign: "center",
          marginBottom: 28,
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        }}>
           <div style={{ fontWeight: 600, fontSize: 22, color: BRAND.navy }}>
            Makali&#699;i Metrics CRM
          </div>

          <div style={{ fontSize: 14, color: BRAND.gray, marginTop: 6 }}>
            Enter your admin credentials to sign in
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: "block", fontSize: 13, fontWeight: 600,
              color: BRAND.navy, marginBottom: 8,
            }}>
              login
            </label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="enter email or username"              
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: "block", fontSize: 13, fontWeight: 600,
              color: BRAND.navy, marginBottom: 8,
            }}>
              password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="enter password"
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 10,
              background: "#fef2f2", color: BRAND.red,
              fontSize: 13, marginBottom: 16, lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            style={{
              width: "100%",
              padding: "15px 0",
              borderRadius: 12,
              border: "none",
              background: BRAND.navy,
              color: BRAND.white,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading || !email.trim() || !password ? 0.6 : 1,
              fontFamily: "inherit",
              letterSpacing: "0.02em",
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
