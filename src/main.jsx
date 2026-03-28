import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css"; // ✅ make sure styles are applied

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);