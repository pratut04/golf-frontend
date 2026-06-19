import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>🏌️</div>
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
      </div>
    </div>
  );
}

export default Login;