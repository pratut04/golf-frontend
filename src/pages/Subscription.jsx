import React from "react";
import API from "../api/api";

function Subscription() {
  const userId = localStorage.getItem("userId");

  const subscribe = async (type) => {
    try {
      await API.post("/subscribe", {
        user_id: userId,
        type: type
      });

      alert("✅ Subscribed successfully");
      window.location.href = "/dashboard";

    } catch (err) {
      console.error(err);
      alert("❌ Subscription failed");
    }
  };

  return (
    <div style={container}>
      <h1>💳 Choose Subscription</h1>

      <div style={card}>
        <h2>Monthly Plan</h2>
        <button onClick={() => subscribe("monthly")} style={btn}>
          Subscribe Monthly
        </button>
      </div>

      <div style={card}>
        <h2>Yearly Plan</h2>
        <button onClick={() => subscribe("yearly")} style={btn}>
          Subscribe Yearly
        </button>
      </div>
    </div>
  );
}

export default Subscription;

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