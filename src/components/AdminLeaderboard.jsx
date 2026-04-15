import React from "react";
import { useOutletContext } from "react-router-dom";

function AdminLeaderboard() {
  const { leaderboard } = useOutletContext();

  return (
    <div style={card}>
      <h3>🏆 Leaderboard</h3>

      {leaderboard.map((l, i) => (
        <div key={i} style={row}>
          <span>
            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
          </span>

          <span style={{ flex: 1, marginLeft: "10px" }}>
            {l.email}
          </span>

          <span>🎯 {l.best_score}</span>
        </div>
      ))}
    </div>
  );
}

export default AdminLeaderboard;

const card = {
  background: "#ffffff",
  padding: "22px",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  borderBottom: "1px solid #e2e8f0",
};