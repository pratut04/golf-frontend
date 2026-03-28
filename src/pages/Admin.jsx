import React, { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

function Admin() {
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [charities, setCharities] = useState([]);
  const [drawResult, setDrawResult] = useState(null);

  useEffect(() => {
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
      const charityRes = await API.get("/charities");

      setUsers(usersRes.data);
      setScores(scoresRes.data);
      setLeaderboard(leaderRes.data);
      setCharities(charityRes.data);

    } catch (err) {
      console.error("ADMIN LOAD ERROR:", err);
    }
  };

  const runDraw = async () => {
    try {
      const res = await API.post("/draw");
      setDrawResult(res.data);
    } catch (err) {
      console.error("DRAW ERROR:", err);
    }
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
          <p>Total Charities: {charities.length}</p>
          <p>Top Score: {leaderboard[0]?.best_score || 0}</p>
        </div>

        {/* USER MANAGEMENT */}
        <div style={card}>
          <h3>👥 User Management</h3>
          {users.length > 0 ? (
            users.map((u) => (
              <div key={u.id} style={item}>
                {u.email}
              </div>
            ))
          ) : (
            <p>No users</p>
          )}
        </div>

        {/* SCORE MANAGEMENT */}
        <div style={card}>
          <h3>🏆 Score Management</h3>
          {scores.length > 0 ? (
            scores.slice(0, 10).map((s) => {
              const user = users.find((u) => u.id === s.user_id);
              return (
                <div key={s.id} style={item}>
                  {user?.email || "Unknown"} → {s.score}
                </div>
              );
            })
          ) : (
            <p>No scores</p>
          )}
        </div>

        {/* DRAW MANAGEMENT */}
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

        {/* CHARITY MANAGEMENT */}
        <div style={card}>
          <h3> Charity Management</h3>

          {charities.length > 0 ? (
            charities.map((c) => (
              <div key={c.id} style={item}>
                {c.name}
              </div>
            ))
          ) : (
            <p>No charities</p>
          )}
        </div>

        {/* WINNERS */}
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
