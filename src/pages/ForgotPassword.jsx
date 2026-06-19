import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) { setMsg("⚠️ Please enter your email"); return; }
    setLoading(true);
    setMsg("");
    try {
      await API.post("/forgot-password", { email });
      setMsg("✅ Reset link sent to your email");
    } catch (err) {
      setMsg(err.response?.data?.error || "❌ Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔐</div>
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">
          Enter your email and we'll send a reset link
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        <button className="auth-btn" onClick={handleSubmit} disabled={loading} style={{ marginTop: "8px" }}>
          {loading ? "Sending…" : "Send Reset Link"}
        </button>

        {msg && (
          <p className={`auth-msg ${msg.includes("✅") ? "success" : "error"}`}>
            {msg}
          </p>
        )}

        <p className="auth-link" onClick={() => navigate("/")}>
          ← Back to Login
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;