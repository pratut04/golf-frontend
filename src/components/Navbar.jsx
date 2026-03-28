import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");

    navigate("/"); // ✅ better than reload
  };

  return (
    <div style={nav}>
      <h2>🏌️ Golf App</h2>

      <div style={links}>
        <button
          style={btn}
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>

        {/* 🔐 ADMIN ONLY */}
        {email === "secure@gmail.com" && (
          <button
            style={btn}
            onClick={() => navigate("/admin")}
          >
            Admin
          </button>
        )}

        <button style={logoutBtn} onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;

// 🎨 styles
const nav = {
  display: "flex",
  justifyContent: "space-between",
  background: "#111",
  padding: "15px 20px",
  borderBottom: "1px solid #333",
  color: "white"
};

const links = {
  display: "flex",
  gap: "10px"
};

const btn = {
  background: "#222",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer"
};

const logoutBtn = {
  background: "#ff4d4d",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer"
};