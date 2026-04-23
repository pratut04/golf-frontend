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

    if (!email || !password || !confirmPassword) {
      setMsg("Fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      await API.post("/users", {
        email: email.trim(),
        password: password.trim()
      });

      // store email for OTP
      localStorage.setItem("otpEmail", email);

      navigate("/verify-otp", {
        state: { email }
      });

    } catch (err) {
      setMsg(
        err.response?.data?.message || "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Create Account ✨</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={signup}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading && <span className="spinner"></span>}
          {loading ? "Sending OTP..." : "Signup"}
        </button>

        <p
          style={{ marginTop: "12px", cursor: "pointer", color: "#2563eb" }}
          onClick={() => navigate("/login")}
        >
          Already have account? Login
        </p>

        {msg && (
          <p style={{ marginTop: "10px", color: "red" }}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

export default Signup;

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#020617"
  },
  card: {
    background: "rgba(30,41,59,0.6)",
    backdropFilter: "blur(16px)",
    padding: "35px",
    borderRadius: "16px",
    width: "320px",
    textAlign: "center",
    boxShadow: "0 10px 40px rgba(0,0,0,0.6)"
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    marginTop: "10px",
    background: "linear-gradient(135deg,#22c55e,#3b82f6)",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  error: {
    color: "#ef4444",
    fontSize: "14px",
    marginTop: "10px"
  },
  link: {
    marginTop: "15px",
    color: "#3b82f6",
    cursor: "pointer",
    fontSize: "14px"
  },
  eye: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer"
  }
};