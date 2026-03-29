import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

import AdminUsers from "../components/AdminUsers";
import AdminScores from "../components/AdminScores";
import AdminCharities from "../components/AdminCharities";

function Admin() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [drawResult, setDrawResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    if (!token) {
      navigate("/");
      return;
    }

    if (email !== "secure@gmail.com") {
      navigate("/dashboard");
      return;
    }

    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await API.get("/leaderboard");
      setLeaderboard(res.data);
    } catch (err) {
      console.error("ADMIN LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const runDraw = async () => {
    try {
      const res = await API.post("/draw");
      setDrawResult(res.data);
      loadLeaderboard();
    } catch (err) {
      console.error("DRAW ERROR:", err);
    }
  };

  if (loading) {
    return <p style={{ color: "white", textAlign: "center" }}>Loading...</p>;
  }

  return (
    <div style={container}>
      <Navbar />

      <div style={content}>
        <h1>⚙️ ADMIN DASHBOARD</h1>

        {/* DRAW */}
        <div style={card}>
          <h3>🎲 Draw Management</h3>

          <button style={btn} onClick={runDraw}>
            Run Draw
          </button>

          {drawResult && (
            <p style={{ marginTop: "10px" }}>
              Latest Draw: {drawResult.numbers}
            </p>
          )}
        </div>

        {/* MANAGEMENT */}
        <h2 style={{ marginTop: "20px" }}>📊 Management</h2>

        <AdminUsers />
        <AdminScores />
        <AdminCharities />

        {/* LEADERBOARD */}
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

// styles
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
