import React, { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

function Dashboard() {
  const userId = localStorage.getItem("userId");

  const [data, setData] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // 🔐 protect route
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const d = await API.get(`/dashboard/${userId}`);
      const l = await API.get("/leaderboard");

      setData(d.data);
      setLeaderboard(l.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ color: "white" }}>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>🎯 Dashboard</h1>

        <div style={card}>
          <p>Email: {data.user?.email}</p>
          <p>Status: {data.user?.subscription_status}</p>
        </div>

        <h3>🏆 Leaderboard</h3>
        <div style={section}>
          {leaderboard.map((l, i) => (
            <div key={i} style={card}>
              #{i + 1} {l.email} → {l.best_score}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

// styles
const section = {
  background: "#111",
  padding: "10px",
  borderRadius: "8px"
};

const card = {
  padding: "10px",
  margin: "10px 0",
  background: "#1e1e1e",
  borderRadius: "6px",
  color: "white"
};
