import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

function Subscription() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    // 🔐 PROTECT PAGE
    if (!token || !userId) {
      navigate("/");
    }
  }, []);

  const subscribe = async (type) => {
    if (loading) return;

    const userId = localStorage.getItem("userId");

    try {
      setLoading(true);

      await API.post("/subscribe", {
        user_id: userId,
        type: type
      });

      alert("✅ Subscribed successfully");

      // ✅ React navigation (NO reload)
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("❌ Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <h1>💳 Choose Subscription</h1>

      <div style={card}>
        <h2>Monthly Plan</h2>
        <button
          onClick={() => subscribe("monthly")}
          style={btn}
          disabled={loading}
        >
          {loading ? "Processing..." : "Subscribe Monthly"}
        </button>
      </div>

      <div style={card}>
        <h2>Yearly Plan</h2>
        <button
          onClick={() => subscribe("yearly")}
          style={btn}
          disabled={loading}
        >
          {loading ? "Processing..." : "Subscribe Yearly"}
        </button>
      </div>
    </div>
  );
}

export default Subscription;

// 🎨 styles
const container = {
  textAlign: "center",
  padding: "40px",
  color: "white",
  background: "#0f172a",
  minHeight: "100vh"
};

const card = {
  background: "#1e293b",
  padding: "20px",
  margin: "20px auto",
  borderRadius: "10px",
  width: "300px"
};

const btn = {
  padding: "10px",
  background: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};
