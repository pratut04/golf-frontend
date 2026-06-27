import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const [menuOpen, setMenuOpen] = useState(false);
  const { dark, toggle } = useTheme();

  const closeMenu = () => setMenuOpen(false);

  const logout = () => {
    localStorage.clear();
    closeMenu();
    navigate("/");
  };

  const goToSubscription = () => {
    const token = localStorage.getItem("token");
    const isGuest = localStorage.getItem("guest") === "true" && !token;

    closeMenu();

    if (isGuest) {
      localStorage.setItem("redirectAfterLogin", "/subscription");
      alert("🔒 Please sign in to continue with subscription");
      navigate("/");
      return;
    }

    navigate("/subscription");
  };

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="navbar-brand">🏌️ Golf App</div>

      {/* Hamburger — visible on mobile */}
      <button
        className={`navbar-hamburger${menuOpen ? " open" : ""}`}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Links */}
      <div className={`navbar-links${menuOpen ? " open" : ""}`}>
        <button
          className="nav-btn"
          onClick={() => { navigate("/dashboard"); closeMenu(); }}
        >
          Dashboard
        </button>

        <button className="nav-btn" onClick={goToSubscription}>
          Subscription
        </button>

        {/* Admin only */}
        {email === "secure@gmail.com" && (
          <button
            className="nav-btn"
            onClick={() => { navigate("/admin"); closeMenu(); }}
          >
            Admin
          </button>
        )}

        {/* Night Mode Toggle */}
        <button
          className="nav-btn theme-toggle-btn"
          onClick={() => { toggle(); closeMenu(); }}
          aria-label="Toggle night mode"
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>

        <button className="nav-btn-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;