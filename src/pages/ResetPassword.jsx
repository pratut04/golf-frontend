import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const getStrength = () => {
    if (password.length < 6) return { label: "Weak", color: "#ef4444" };
    if (password.length < 10) return { label: "Medium", color: "#facc15" };
    return { label: "Strong", color: "#22c55e" };
  };

  const handleReset = async () => {
    if (!password || !confirm) { setMsg("⚠️ Fill all fields"); return; }
    if (password !== confirm) { setMsg("❌ Passwords do not match"); return; }

    setLoading(true);
    setMsg("");

    try {
      await API.post(`/reset-password/${token}`, { password });
      setMsg("✅ Password updated successfully");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMsg(err.response?.data?.error || "❌ Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔑</div>
        <h2>Reset Password</h2>
        <p className="auth-subtitle">Enter your new password below</p>

        {/* New password with eye toggle */}
        <div className="auth-input-wrap">
          <input
            type={show ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="eye" onClick={() => setShow(!show)}>
            {show ? "🙈" : "👁"}
          </span>
        </div>

        {password && (
          <p className="strength-text" style={{ color: strength.color }}>
            Strength: {strength.label}
          </p>
        )}

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button
          className="auth-btn"
          onClick={handleReset}
          disabled={loading}
          style={{ marginTop: "8px" }}
        >
          {loading ? "Updating…" : "Reset Password"}
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

export default ResetPassword;