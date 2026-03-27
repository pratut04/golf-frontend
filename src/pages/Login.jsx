import React, { useState } from "react";
import API from "../api/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await API.post("/login", { email, password });

    localStorage.setItem("userId", res.data.user.id);

    if (email === "secure@gmail.com") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="login-box">
      <h2>Login</h2>
      <input onChange={(e)=>setEmail(e.target.value)} placeholder="Email"/>
      <input type="password" onChange={(e)=>setPassword(e.target.value)} placeholder="Password"/>
      <button onClick={login}>Login</button>
    </div>
  );
}

export default Login;