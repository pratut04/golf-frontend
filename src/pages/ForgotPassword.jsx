import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) {
      setMsg("⚠️ Please enter your email");
      return;
    }

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
    <div style={container}>
      <div style={card}>
        <h2 style={title}>🔐 Forgot Password</h2>

        <p style={subtitle}>
          Enter your email and we’ll send you a reset link
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
          onFocus={(e) =>
            (e.target.style.boxShadow = "0 0 0 2px #3b82f6")
          }
          onBlur={(e) => (e.target.style.boxShadow = "none")}
        />

        <button onClick={handleSubmit} style={button} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {/* MESSAGE */}
        {msg && (
          <p
            style={{
              ...message,
              color: msg.includes("✅") ? "#22c55e" : "#f87171"
            }}
          >
            {msg}
          </p>
        )}

        {/* BACK TO LOGIN */}
        <p
          onClick={() => navigate("/")}
          style={back}
        >
          ← Back to Login
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;

//
//  STYLES
//

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #0f172a, #1e293b)",
};

const card = {
  width: "360px",
  padding: "32px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(14px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
  textAlign: "center",
  transition: "0.3s ease"
};

const title = {
  color: "white",
  marginBottom: "10px",
  fontWeight: "800",
  fontSize: "22px"
};

const subtitle = {
  color: "#94a3b8",
  fontSize: "14px",
  marginBottom: "20px",
};

const input = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  marginBottom: "15px",
  outline: "none",
  transition: "0.2s"
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
  transition: "0.2s"
};

const message = {
  marginTop: "15px",
  fontSize: "14px",
};

const back = {
  marginTop: "18px",
  fontSize: "13px",
  color: "#3b82f6",
  cursor: "pointer"
};