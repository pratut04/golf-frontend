import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const navigate = useNavigate();

  const signup = async () => {
    if (loading) return;
    if (!email || !password || !confirmPassword) { setMsg("Fill all fields"); return; }
    if (password !== confirmPassword) { setMsg("Passwords do not match"); return; }

    setLoading(true);
    setMsg("");

    try {
      await API.post("/users", { email: email.trim(), password: password.trim() });
      localStorage.setItem("otpEmail", email);
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setMsg(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") signup(); };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>✨</div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join Golf App and start playing smarter</p>

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

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={handleKey}
        />

        <button
          className="auth-btn"
          onClick={signup}
          disabled={loading}
          style={{ marginTop: "12px" }}
        >
          {loading && <span className="spinner" />}
          {loading ? "Sending OTP…" : "Create Account"}
        </button>

        <p className="auth-link" onClick={() => navigate("/login")}>
          Already have an account? Login
        </p>

        {msg && <p className="auth-msg error">{msg}</p>}
      </div>
    </div>
  );
}

export default Signup;