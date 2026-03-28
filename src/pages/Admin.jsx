import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://golf-backend-new.onrender.com";

function Admin() {
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [drawResult, setDrawResult] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const usersRes = await axios.get(`${API}/users`);
      const scoresRes = await axios.get(`${API}/scores`);
      const leaderRes = await axios.get(`${API}/leaderboard`);

      setUsers(usersRes.data);
      setScores(scoresRes.data);
      setLeaderboard(leaderRes.data);

    } catch (err) {
      console.log(err);
    }
  };

  // 🎲 Run Draw
  const runDraw = async () => {
    const res = await axios.post(`${API}/draw`);
    setDrawResult(res.data);
    alert(`Draw Number: ${res.data.numbers}`);
  };

  // 📊 Stats
  const totalUsers = users.length;
  const totalScores = scores.length;

  return (
    <div style={{ padding: "20px" }}>
      <h1>🔥 Admin Dashboard</h1>

      {/* 📊 STATS */}
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={box}>Total Users: {totalUsers}</div>
        <div style={box}>Total Scores: {totalScores}</div>
      </div>

      {/* 🎲 DRAW */}
      <h2>Draw Control</h2>
      <button onClick={runDraw}>Run Draw 🎲</button>

      {drawResult && (
        <p>Latest Draw Number: {drawResult.numbers}</p>
      )}

      {/* 👥 USERS */}
      <h2>Users</h2>
      {users.map((u) => (
        <div key={u.id} style={card}>
          {u.email}
        </div>
      ))}

      {/* 🏆 SCORES */}
      <h2>Scores</h2>
      {scores.map((s) => {
        const user = users.find((u) => u.id === s.user_id);

        return (
          <div key={s.id} style={card}>
            {user ? user.email : "Unknown"} → {s.score}
          </div>
        );
      })}

      {/* 🥇 LEADERBOARD */}
      <h2>Leaderboard</h2>
      {leaderboard.map((l, i) => (
        <div key={i} style={card}>
          #{i + 1} {l.email} → {l.best_score}
        </div>
      ))}
    </div>
  );
}

// 🎨 styles
const box = {
  background: "#222",
  color: "white",
  padding: "15px",
  borderRadius: "8px"
};

const card = {
  padding: "10px",
  margin: "5px 0",
  background: "#f4f4f4",
  borderRadius: "6px"
};

export default Admin;
