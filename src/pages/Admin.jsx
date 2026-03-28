import React, { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

function Admin() {
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [drawResult, setDrawResult] = useState(null);

  useEffect(() => {
    //  protect route
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const usersRes = await API.get("/users");
      const scoresRes = await API.get("/scores");
      const leaderRes = await API.get("/leaderboard");

      setUsers(usersRes.data);
      setScores(scoresRes.data);
      setLeaderboard(leaderRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const runDraw = async () => {
    const res = await API.post("/draw");
    setDrawResult(res.data);
  };

  return (
    <div style={{ color: "white" }}>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>Admin Dashboard</h1>

        {/* STATS */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={box}>Users: {users.length}</div>
          <div style={box}>Scores: {scores.length}</div>
        </div>

        {/* DRAW */}
        <button onClick={runDraw}>Run Draw 🎲</button>
        {drawResult && <p>Number: {drawResult.numbers}</p>}

        {/* GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>

          {/* USERS */}
          <div>
            <h3>👥 Users</h3>
            <div style={section}>
              {users.map((u) => (
                <div key={u.id} style={card}>{u.email}</div>
              ))}
            </div>
          </div>

          {/* SCORES */}
          <div>
            <h3>🏆 Scores</h3>
            <div style={section}>
              {scores.slice(0, 10).map((s) => {
                const user = users.find((u) => u.id === s.user_id);
                return (
                  <div key={s.id} style={card}>
                    {user?.email} → {s.score}
                  </div>
                );
              })}
            </div>
          </div>

          {/* LEADERBOARD */}
          <div style={{ gridColumn: "span 2" }}>
            <h3>🥇 Leaderboard</h3>
            <div style={section}>
              {leaderboard.map((l, i) => (
                <div key={i} style={card}>
                  #{i + 1} {l.email} → {l.best_score}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Admin;

// styles
const section = {
  background: "#111",
  padding: "10px",
  borderRadius: "8px",
  maxHeight: "300px",
  overflowY: "auto"
};

const card = {
  padding: "8px",
  margin: "5px 0",
  background: "#1e1e1e",
  color: "white",
  borderRadius: "6px",
  border: "1px solid #333"
};

const box = {
  background: "#222",
  color: "white",
  padding: "15px",
  borderRadius: "8px"
};
