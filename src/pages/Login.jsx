import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [msg, setMsg] = useState("");

  const navigate = useNavigate(); //  important

  const login = async () => {
    if (loading) return;

    if (!email || !password) {
      setMsg("Enter email and password");
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
      localStorage.setItem("role", res.data.user.role);
      localStorage.removeItem("guest");

      // ✅ REDIRECT
      // ✅ REDIRECT
      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        const redirect = localStorage.getItem("redirectAfterLogin");

        if (redirect) {
          localStorage.removeItem("redirectAfterLogin"); // 🔥 VERY IMPORTANT
          navigate(redirect);
        } else {
          navigate("/dashboard");
        }
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

  const signup = async () => {
    try {
      if (!email || !password) {
        setMsg("Enter email & password");
        return;
      }

      await API.post("/users", {
        email: email.trim(),
        password: password.trim()
      });

      setMsg("Account created ✅ Now login");
      setIsSignup(false);

    } catch (err) {
      setMsg(err.response?.data?.error || "Signup failed ❌");
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

        {/* ✅ ADD THIS */}
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

        <button onClick={isSignup ? signup : login} disabled={loading}>
          {loading ? "Loading..." : isSignup ? "Signup" : "Login"}
        </button>

        <p style={{ marginTop: "10px", cursor: "pointer", color: "#2563eb" }}
          onClick={() => {
            setIsSignup(!isSignup);
            setMsg("");
          }}>
          {isSignup ? "Already have account? Login" : "Create new account"}
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
