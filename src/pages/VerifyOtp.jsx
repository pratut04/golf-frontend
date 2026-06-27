import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem("otpEmail");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // countdown
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  if (!email) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2 style={{ color: "white" }}>Email missing!</h2>
          <p className="auth-subtitle">Please sign up again.</p>
          <button className="auth-btn" onClick={() => navigate("/signup")}>
            Go to Signup
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1].focus();
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    const finalOtp = otp.join("");

    try {
      const res = await fetch("https://golf-backend.onrender.com/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: finalOtp }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Verified ✅");
        navigate("/login");
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch {
      setError("Server error");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendLoading) return;
    setResendLoading(true);
    setError("");
    try {
      await fetch("https://golf-backend.onrender.com/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setTimer(30);
      setMessage("New OTP sent ✅");
      setError("");
    } catch {
      setError("Failed to resend");
      setMessage("");
    }
    setResendLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>📩</div>
        <h2>Verify OTP</h2>
        <p className="auth-subtitle">Code sent to {email}</p>

        {/* 6-box OTP */}
        <div className="otp-box">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              className="otp-input"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              maxLength={1}
              inputMode="numeric"
            />
          ))}
        </div>

        {message && <p className="auth-msg success">{message}</p>}
        {error && <p className="auth-msg error">{error}</p>}

        <button className="auth-btn" onClick={handleVerify} disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? "Verifying…" : "Verify OTP"}
        </button>

        <div style={{ marginTop: "16px" }}>
          {timer > 0 && (
            <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "10px" }}>
              Resend OTP in <b>{timer}s</b>
            </p>
          )}

          <button
            className="auth-btn"
            onClick={handleResend}
            disabled={timer > 0 || resendLoading}
            style={{
              background:
                timer > 0
                  ? "#334155"
                  : "linear-gradient(135deg, #6366f1, #3b82f6)",
              opacity: timer > 0 ? 0.6 : 1,
              boxShadow:
                timer === 0 ? "0 6px 20px rgba(59,130,246,0.4)" : "none",
              cursor: timer > 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {resendLoading && <span className="spinner" />}
            {resendLoading ? "Sending…" : timer > 0 ? `Wait ${timer}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
