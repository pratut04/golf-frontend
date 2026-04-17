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

  // 🔥 password strength
  const getStrength = () => {
    if (password.length < 6) return "Weak";
    if (password.length < 10) return "Medium";
    return "Strong";
  };

  const handleReset = async () => {
    if (!password || !confirm) {
      setMsg("⚠️ Fill all fields");
      return;
    }

    if (password !== confirm) {
      setMsg("❌ Passwords do not match");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      await API.post(`/reset-password/${token}`, {
        password,
      });

      setMsg("✅ Password updated successfully");

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      setMsg(err.response?.data?.error || "❌ Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>🔑 Reset Password</h2>

        <p style={subtitle}>
          Enter your new password below
        </p>

        {/* PASSWORD */}
        <div style={inputWrapper}>
          <input
            type={show ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />
          <span style={eye} onClick={() => setShow(!show)}>
            {show ? "🙈" : "👁"}
          </span>
        </div>

        {/* STRENGTH */}
        {password && (
          <p style={{
            fontSize: "12px",
            color:
              getStrength() === "Weak"
                ? "#ef4444"
                : getStrength() === "Medium"
                ? "#facc15"
                : "#22c55e"
          }}>
            Strength: {getStrength()}
          </p>
        )}

        {/* CONFIRM */}
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={input}
        />

        {/* BUTTON */}
        <button onClick={handleReset} style={button} disabled={loading}>
          {loading ? "Updating..." : "Reset Password"}
        </button>

        {/* MESSAGE */}
        {msg && (
          <p style={{
            marginTop: "12px",
            color: msg.includes("✅") ? "#22c55e" : "#f87171"
          }}>
            {msg}
          </p>
        )}

        {/* BACK */}
        <p style={back} onClick={() => navigate("/")}>
          ← Back to Login
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;

//
// 🎨 PREMIUM STYLES
//

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #020617, #0f172a)",
};

const card = {
  width: "380px",
  padding: "32px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(14px)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
  textAlign: "center",
};

const title = {
  color: "white",
  marginBottom: "10px",
  fontWeight: "800",
};

const subtitle = {
  color: "#94a3b8",
  fontSize: "14px",
  marginBottom: "20px",
};

const inputWrapper = {
  position: "relative",
};

const input = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  marginBottom: "12px",
  outline: "none",
};

const eye = {
  position: "absolute",
  right: "10px",
  top: "12px",
  cursor: "pointer",
};

const button = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(90deg, #22c55e, #3b82f6)",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(34,197,94,0.4)",
};

const back = {
  marginTop: "15px",
  fontSize: "13px",
  color: "#3b82f6",
  cursor: "pointer",
};