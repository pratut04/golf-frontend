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

    if (!email || !password) {
      setMsg("Enter email and password");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      // 🔥 Wake server (Render fix)
      await fetch("https://golf-backend-new.onrender.com");

      let res;

      try {
        res = await API.post("/login", {
          email: email.trim(),
          password: password.trim()
        });
      } catch (err) {
        console.log("Retrying login...");
        await new Promise(r => setTimeout(r, 5000));

        res = await API.post("/login", {
          email: email.trim(),
          password: password.trim()
        });
      }

      // ✅ Store data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("email", res.data.user.email);
      localStorage.setItem("role", res.data.user.role);
      localStorage.removeItem("guest");

      // ✅ Redirect
      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        const redirect = localStorage.getItem("redirectAfterLogin");

        if (redirect) {
          localStorage.removeItem("redirectAfterLogin");
          navigate(redirect);
        } else {
          navigate("/dashboard");
        }
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      if (err.response) {
        setMsg(err.response.data.message || "Login failed");
      } else {
        setMsg("Server not responding. Try again.");
      }


    } finally {
      setLoading(false);
    }
  };

  const skipLogin = () => {
    localStorage.clear();
    localStorage.setItem("guest", "true");
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back 👋</h2>

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

        <p
          onClick={() => navigate("/forgot-password")}
          style={{
            cursor: "pointer",
            color: "#2563eb",
            fontSize: "13px",
            marginTop: "6px",
            marginBottom: "10px",
            textAlign: "right"
          }}
        >
          Forgot Password?
        </p>

        <button
          onClick={login}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading && <span className="spinner"></span>}
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* 🔥 GO TO SIGNUP PAGE */}
        <p
          style={{ marginTop: "12px", cursor: "pointer", color: "#2563eb" }}
          onClick={() => navigate("/signup")}
        >
          Create new account
        </p>

        <button
          style={{
            marginTop: "10px",
            background: "#64748b"
          }}
          onClick={skipLogin}

        >
          Skip as Guest
        </button>

        {msg && (
          <p style={{ marginTop: "10px", color: "red" }}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;