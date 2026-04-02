import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); //  important

const login = async () => {
  if (loading) return;

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  setLoading(true);

  try {
    // 🔥 STEP 1: Wake server
    await fetch("https://golf-backend-new.onrender.com");

    // 🔥 STEP 2: Try login (1st attempt)
    let res;

    try {
      res = await API.post("/login", {
        email: email.trim(),
        password: password.trim()
      });
    } catch (err) {
      // ⏳ WAIT + RETRY (THIS IS THE MAGIC FIX)
      console.log("Retrying login...");
      await new Promise(r => setTimeout(r, 5000));

      res = await API.post("/login", {
        email: email.trim(),
        password: password.trim()
      });
    }

    // ✅ STORE DATA
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("userId", res.data.user.id);
    localStorage.setItem("email", res.data.user.email);

    // ✅ REDIRECT
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
      alert("❌ Server not responding. Try again.");
    }

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-container">
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
    </div>
  );
}

export default Login;
