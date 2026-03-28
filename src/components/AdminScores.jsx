import React, { useEffect, useState } from "react";
import API from "../api/api";

function AdminScores() {
  const [scores, setScores] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const scoresRes = await API.get("/scores");
      const usersRes = await API.get("/users");

      setScores(scoresRes.data);
      setUsers(usersRes.data);

    } catch (err) {
      console.error("SCORES ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={card}>
      <h3>🏆 Score Management</h3>

      {loading ? (
        <p>Loading scores...</p>
      ) : scores.length === 0 ? (
        <p>No scores found</p>
      ) : (
        scores.slice(0, 10).map((s, index) => {
          const user = users.find((u) => u.id === s.user_id);

          return (
            <div key={s.id} style={item}>
              #{index + 1} {user?.email || "Unknown"} → {s.score}
              <br />
              <small>
                {s.created_at
                  ? new Date(s.created_at).toLocaleDateString()
                  : "No date"}
              </small>
            </div>
          );
        })
      )}
    </div>
  );
}

export default AdminScores;

// 🎨 styles
const card = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "20px",
  color: "white"
};

const item = {
  padding: "6px 0",
  borderBottom: "1px solid #333"
};