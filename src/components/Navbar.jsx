import React from "react";

function Navbar() {
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  return (
    <div style={nav}>
      <h2 style={{ margin: 0 }}>🏌️ Golf App</h2>

      <div style={links}>
        <button style={btn} onClick={() => window.location.href="/dashboard"}>
          Dashboard
        </button>

        <button style={btn} onClick={() => window.location.href="/admin"}>
          Admin
        </button>

        <button style={logoutBtn} onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;

//  styles
const nav = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#111",
  padding: "15px 20px",
  borderBottom: "1px solid #333",
  marginBottom: "20px"
};

const links = {
  display: "flex",
  gap: "10px"
};

const btn = {
  padding: "8px 12px",
  background: "#222",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const logoutBtn = {
  padding: "8px 12px",
  background: "#ff4d4d",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};
