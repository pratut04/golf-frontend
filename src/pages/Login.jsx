import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    email: "secure@gmail.com",
    password: "123456",
    icon: "🛡️",
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.10)",
    border: "rgba(99, 102, 241, 0.30)",
  },
  {
    role: "User",
    email: "user2@gmail.com",
    password: "123456",
    icon: "👤",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.10)",
    border: "rgba(34, 197, 94, 0.30)",
  },
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const navigate = useNavigate();

  const login = async () => {
    if (loading) return;
    if (!email || !password) { setMsg("Enter email and password"); return; }

    setLoading(true);
    setMsg("");

    try {
      await fetch("https://golf-backend-new.onrender.com");
      let res;
      try {
        res = await API.post("/login", { email: email.trim(), password: password.trim() });
      } catch (err) {
        await new Promise(r => setTimeout(r, 5000));
        res = await API.post("/login", { email: email.trim(), password: password.trim() });
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("email", res.data.user.email);
      localStorage.setItem("role", res.data.user.role);
      localStorage.removeItem("guest");

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        const redirect = localStorage.getItem("redirectAfterLogin");
        if (redirect) { localStorage.removeItem("redirectAfterLogin"); navigate(redirect); }
        else { navigate("/dashboard"); }
      }
    } catch (err) {
      setMsg(err.response?.data?.message || "Server not responding. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const skipLogin = () => {
    localStorage.clear();
    localStorage.setItem("guest", "true");
    navigate("/dashboard");
  };

  const handleKey = (e) => { if (e.key === "Enter") login(); };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setMsg("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo-wrap">🏌️</div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your Golf account</p>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKey}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKey}
        />

        <p className="auth-forgot" onClick={() => navigate("/forgot-password")}>
          Forgot Password?
        </p>

        <button className="auth-btn" onClick={login} disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? "Logging in…" : "Login"}
        </button>

        <button className="auth-btn-secondary" onClick={skipLogin}>
          👁 Continue as Guest
        </button>

        <p className="auth-link" onClick={() => navigate("/signup")}>
          Don't have an account? Create one
        </p>

        {msg && <p className={`auth-msg error`}>{msg}</p>}

        {/* ── Demo Credentials ── */}
        <div className="demo-creds-section">
          <div className="demo-creds-label">
            <span className="demo-creds-line" />
            <span className="demo-creds-text">🎯 Demo Credentials</span>
            <span className="demo-creds-line" />
          </div>
          <p className="demo-creds-hint">Click a card to auto-fill login</p>
          <div className="demo-creds-grid">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                className="demo-cred-card"
                onClick={() => fillDemo(acc)}
                style={{
                  "--demo-color": acc.color,
                  "--demo-bg": acc.bg,
                  "--demo-border": acc.border,
                }}
              >
                <span className="demo-cred-icon">{acc.icon}</span>
                <span className="demo-cred-role">{acc.role}</span>
                <span className="demo-cred-email">{acc.email}</span>
                <span className="demo-cred-pw">🔑 {acc.password}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;