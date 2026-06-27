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

      setScores(scoresRes.data.data || []);
      setUsers(usersRes.data.data || []);

    } catch (err) {
      console.error("SCORES ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  //  CREATE MAP 
  const userMap = {};
  users.forEach(u => {
    userMap[u.id] = u.email;
  });

  return (
    <div style={card}>
      <h3 style={{ color: "#f1f5f9" }}>🏆 Score Management</h3>

      {loading ? (
        <p>Loading scores...</p>
      ) : scores.length === 0 ? (
        <p>No scores found</p>
      ) : (
        scores
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) //latest first
          .slice(0, 10)
          .map((s, index) => (
            <div key={s.id} style={item}>
              #{index + 1} {userMap[s.user_id] || "Unknown"} → {s.score}
              <br />
              <small style={{ color: "#94a3b8" }}>
                {s.created_at
                  ? new Date(s.created_at).toLocaleDateString()
                  : "No date"}
              </small>
            </div>
          ))
      )}
    </div>
  );
}

export default AdminScores;

//  styles
const card = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "20px",
  color: "#e5e7eb"
};

const item = {
  padding: "6px 0",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  color: "#e5e7eb"
};