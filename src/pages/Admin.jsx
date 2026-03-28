import React, { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

function Admin() {
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [drawResult, setDrawResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // protect route
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const usersRes = await API.get("/users");
      const scoresRes = await API.get("/scores");
      const leaderRes = await API.get("/leaderboard");

      setUsers(usersRes.data);
      setScores(scoresRes.data);
      setLeaderboard(leaderRes.data);

    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
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

  
  if (loading) {
    return <h2 style={{ color: "white", padding: "20px" }}>Loading...</h2>;
  }

 return (
  <div style={{ background: "#0f172a", minHeight: "100vh", color: "white" }}>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>Admin Dashboard</h1>

        {/* STATS */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={box}>Users: {users.length}</div>
          <div style={box}>Scores: {scores.length}</div>
        </div>

        {/* DRAW */}
        <button style={btn} onClick={runDraw}>
          Run Draw 🎲
        </button>

        {drawResult && (
          <div style={box}>
            🎯 Latest Draw: <b>{drawResult.numbers}</b>
          </div>
        )}

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginTop: "20px"
          }}
        >

          {/* USERS */}
          <div>
            <h3>👥 Users</h3>
            <div style={section}>
              {users.length === 0 ? (
                <p>No users</p>
              ) : (
                users.map((u) => (
                  <div key={u.id} style={card}>{u.email}</div>
                ))
              )}
            </div>
          </div>

          {/* SCORES */}
          <div>
            <h3>🏆 Scores</h3>
            <div style={section}>
              {scores.length === 0 ? (
                <p>No scores</p>
              ) : (
                scores.slice(0, 10).map((s) => {
                  const user = users.find((u) => u.id === s.user_id);
                  return (
                    <div key={s.id} style={card}>
                      {user?.email || "Unknown"} → {s.score}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* LEADERBOARD */}
          <div style={{ gridColumn: "span 2" }}>
            <h3>🥇 Leaderboard</h3>
            <div style={section}>
              {leaderboard.length === 0 ? (
                <p>No leaderboard data</p>
              ) : (
                leaderboard.map((l, i) => (
                  <div key={i} style={card}>
                    #{i + 1} {l.email} → {l.best_score}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Admin;

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

const btn = {
  padding: "10px 15px",
  background: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginTop: "10px"
};
