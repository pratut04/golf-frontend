import React, { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

// ✅ COMPONENTS
import AdminUsers from "../components/AdminUsers";
import AdminScores from "../components/AdminScores";
import AdminCharities from "../components/AdminCharities";

function Admin() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [drawResult, setDrawResult] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    // 🔐 protect route
    if (!token) {
      window.location.href = "/";
    }

    // 🔐 restrict admin access
    if (email !== "secure@gmail.com") {
      window.location.href = "/dashboard";
    }

    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await API.get("/leaderboard");
      setLeaderboard(res.data);
    } catch (err) {
      console.error("ADMIN LOAD ERROR:", err);
    }
  };

  const runDraw = async () => {
    try {
      const res = await API.post("/draw");
      setDrawResult(res.data);

      // 🔥 refresh leaderboard
      loadLeaderboard();

    } catch (err) {
      console.error("DRAW ERROR:", err);
    }
  };

  return (
    <div style={container}>
      <Navbar />

      <div style={content}>
        <h1>⚙️ ADMIN DASHBOARD</h1>

        {/* 🎲 DRAW */}
        <div style={card}>
          <h3>🎲 Draw Management</h3>

          <button style={btn} onClick={runDraw}>
            Run Draw
          </button>

          {drawResult && (
            <div style={{ marginTop: "10px" }}>
              <p>Latest Draw: {drawResult.numbers}</p>
            </div>
          )}
        </div>

        {/* 📊 MANAGEMENT */}
        <h2 style={{ marginTop: "20px" }}>📊 Management</h2>

        <AdminUsers />
        <AdminScores />
        <AdminCharities />

        {/* 🏆 WINNERS */}
        <div style={card}>
          <h3>🏆 Winners</h3>

          {leaderboard.length > 0 ? (
            leaderboard.map((l, i) => (
              <div key={i} style={item}>
                #{i + 1} {l.email} → {l.best_score}
              </div>
            ))
          ) : (
            <p>No winners yet</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default Admin;

// 🎨 styles
const container = {
  background: "#0f172a",
  minHeight: "100vh",
  color: "white"
};

const content = {
  padding: "20px",
  maxWidth: "900px",
  margin: "auto"
};

const card = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "20px"
};

const item = {
  padding: "6px 0",
  borderBottom: "1px solid #333"
};

const btn = {
  padding: "8px 12px",
  background: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};