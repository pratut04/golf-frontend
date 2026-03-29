import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // ✅ important

  const login = async () => {
    if (loading) return;

    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    try {
      setLoading(true);

      // 🔥 wake backend (Render sleep fix)
      await fetch("https://golf-backend-new.onrender.com");

      const res = await API.post("/login", {
        email: email.trim(),
        password: password.trim()
      });

      // ✅ STORE DATA
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("email", res.data.user.email);

      // ✅ REDIRECT (React way - NO reload)
      if (res.data.user.email === "secure@gmail.com") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      if (err.response) {
        alert(err.response.data.error);
      } else {
        alert("⏳ Server is waking up...\nTry again in 10–20 seconds");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-box">
      <h2>Login</h2>

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

      <button onClick={login} disabled={loading}>
        {loading ? "Loading..." : "Login"}
      </button>
    </div>
  );
}

export default Login;
