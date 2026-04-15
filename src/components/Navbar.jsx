import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");

    navigate("/");
  };

  return (
    <div style={nav}>
      <h2>🏌️ Golf App</h2>

      <div style={links}>
        <button
          style={navBtn}
          onClick={() => navigate("/dashboard")}
          onMouseEnter={(e) => {
            e.target.style.background = "#1e293b";
            e.target.style.boxShadow = "none";   // ✅ remove glow
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
          }}
        >
          Dashboard
        </button>

        {/* NEW SUBSCRIPTION BUTTON */}
        <button
          style={navBtn}
          onClick={() => navigate("/subscription")}
          onMouseEnter={(e) => {
            e.target.style.background = "#1e293b";
            e.target.style.boxShadow = "none";   // ✅ remove glow
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
          }}
        >
          Subscription
        </button>

        {/*  ADMIN ONLY */}
        {email === "secure@gmail.com" && (
          <button
            style={navBtn}
            onClick={() => navigate("/admin")}
            onMouseEnter={(e) => {
              e.target.style.background = "#1e293b";
              e.target.style.boxShadow = "none";   // ✅ remove glow
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
            }}
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


const nav = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 24px",
  background: "rgba(2,6,23,0.8)",
  backdropFilter: "blur(10px)",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  color: "#e5e7eb",
  outline: "none"
};

const links = {
  display: "flex",
  gap: "10px"
};

const btn = {
  background: "transparent",
  color: "#cbd5e1",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "8px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.25s ease"
};

const logoutBtn = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  boxShadow: "0 4px 14px rgba(239,68,68,0.5)"
};

const navBtn = {
  background: "transparent",
  color: "#e2e8f0",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "8px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "none"   // ✅ IMPORTANT (removes green glow)
};