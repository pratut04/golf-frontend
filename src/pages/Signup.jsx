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
    setMsg("Waking server… please wait");

    try {
      // Wake up Render's sleeping server (free tier spins down after inactivity)
      await fetch("https://golf-backend-new.onrender.com").catch(() => {});

      setMsg("Sending OTP…");

      let res;
      try {
        res = await API.post("/users", { email: email.trim(), password: password.trim() });
      } catch (err) {
        // If it still times out, wait 5s and retry once
        setMsg("Server is starting up, retrying…");
        await new Promise(r => setTimeout(r, 5000));
        res = await API.post("/users", { email: email.trim(), password: password.trim() });
      }

      if (res.data.success) {
        localStorage.setItem("otpEmail", email);
        navigate("/verify-otp", { state: { email } });
      }
    } catch (err) {
      setMsg(err.response?.data?.message || "Server not responding. Please try again.");
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
          {loading ? (msg || "Sending OTP…") : "Create Account"}
        </button>

        <p className="auth-link" onClick={() => navigate("/login")}>
          Already have an account? Login
        </p>

        {!loading && msg && <p className="auth-msg error">{msg}</p>}
      </div>
    </div>
  );
}

export default Signup;