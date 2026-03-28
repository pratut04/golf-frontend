import React, { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

function Admin() {
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [drawResult, setDrawResult] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const usersRes = await API.get("/users");
    const scoresRes = await API.get("/scores");
    const leaderRes = await API.get("/leaderboard");

    setUsers(usersRes.data);
    setScores(scoresRes.data);
    setLeaderboard(leaderRes.data);
  };

  const runDraw = async () => {
    const res = await API.post("/draw");
    setDrawResult(res.data);
  };

  return (
    <div style={container}>
      <Navbar />

      <div style={content}>
        <h1>⚙️ ADMIN DASHBOARD</h1>

        {/* REPORTS */}
        <div style={card}>
          <h3>📊 Reports & Analytics</h3>
          <p>Total Users: {users.length}</p>
          <p>Total Scores: {scores.length}</p>
          <p>Top Score: {leaderboard[0]?.best_score || 0}</p>
        </div>

        {/* USER MANAGEMENT */}
        <div style={card}>
          <h3>👥 User Management</h3>
          {users.map((u) => (
            <div key={u.id} style={item}>
              {u.email}
            </div>
          ))}
        </div>

        {/*  SCORE MANAGEMENT */}
        <div style={card}>
          <h3>🏆 Score Management</h3>
          {scores.slice(0, 10).map((s) => {
            const user = users.find((u) => u.id === s.user_id);
            return (
              <div key={s.id} style={item}>
                {user?.email} → {s.score}
              </div>
            );
          })}
        </div>

        {/*  DRAW MANAGEMENT */}
        <div style={card}>
          <h3>🎲 Draw Management</h3>

          <button style={btn} onClick={runDraw}>
            Run Draw
          </button>

          {drawResult && (
            <p>Latest Draw: {drawResult.numbers}</p>
          )}
        </div>

        {/* WINNERS */}
        <div style={card}>
          <h3>🏆 Winners</h3>
          {leaderboard.map((l, i) => (
            <div key={i} style={item}>
              #{i + 1} {l.email} → {l.best_score}
            </div>
          ))}
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
