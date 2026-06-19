import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./global.css";  // 🌐 global responsive design system
import "./App.css";     // ✅ existing styles (partially kept)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);