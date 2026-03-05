import { useState } from "react";
import { motion } from "framer-motion";
import { adminLogin } from "../api/client";

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) { setError("Please enter username and password."); return; }
    setLoading(true); setError("");
    try {
      await adminLogin(username, password);
      onLogin();
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#1e1a15", border: "1px solid rgba(212,167,85,0.15)",
    color: "#f0e9dc", padding: "0.85rem 1rem", fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;600&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ minHeight: "100vh", background: "#0f0d0b", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
          style={{ background: "#171410", border: "1px solid rgba(212,167,85,0.15)", padding: "3rem", maxWidth: 420, width: "100%" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#c8702a", marginBottom: "0.6rem" }}>Staff Portal</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "#f0e9dc", fontWeight: 400 }}>
            Ember <em style={{ color: "#d4a755" }}>&</em> Oak
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "rgba(232,223,208,0.45)", marginTop: "0.4rem" }}>Admin dashboard login</p>

          <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(232,223,208,0.5)", marginBottom: "0.4rem" }}>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()} style={inputStyle} placeholder="admin" />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(232,223,208,0.5)", marginBottom: "0.4rem" }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()} style={inputStyle} placeholder="••••••••" />
            </div>
          </div>

          {error && <p style={{ color: "#e07070", fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", marginTop: "0.8rem" }}>{error}</p>}

          <motion.button onClick={handleLogin} disabled={loading}
            whileHover={!loading ? { boxShadow: "0 0 28px rgba(212,167,85,0.4)", background: "#d4a755", color: "#0f0d0b" } : {}}
            style={{ width: "100%", marginTop: "1.8rem", background: loading ? "#444" : "#c8702a", color: "#f0e9dc", border: "none", padding: "1rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.25s" }}>
            {loading ? "Signing in…" : "Sign In"}
          </motion.button>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "rgba(232,223,208,0.3)", marginTop: "1.5rem", textAlign: "center" }}>
            Default: admin / ember2024
          </p>
        </motion.div>
      </div>
    </>
  );
}
