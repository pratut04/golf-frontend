import React, { useState } from "react";
import API from "../api/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    console.log("LOGIN CLICKED");

    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    try {
      setLoading(true);
      console.log("Sending request...");

      const res = await API.post("/login", { email, password });

      console.log("RESPONSE:", res.data);

      // ✅ store token
      localStorage.setItem("token", res.data.token);

      // ✅ store user id
      localStorage.setItem("userId", res.data.user.id);

      // ✅ redirect
      if (email === "secure@gmail.com") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      alert("⏳ Server is waking up...\nTry again in 10–20 seconds");

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
