import React from "react";

function Navbar() {
  const logout = () => {
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  return (
    <div className="card">
      <h3>🏌️ Golf Platform</h3>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Navbar;