import React, { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

import ScoreForm from "../components/ScoreForm";
import CharityList from "../components/CharityList";
import Winnings from "../components/Winnings";

function Dashboard() {
  const userId = localStorage.getItem("userId");

  const [data, setData] = useState({});
  const [charities, setCharities] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
    }
    loadData();
  }, []);

  const loadData = async () => {
    const d = await API.get(`/dashboard/${userId}`);
    const c = await API.get("/charities");
    const l = await API.get("/leaderboard");

    setData(d.data);
    setCharities(c.data);
    setLeaderboard(l.data);
  };

  const addScore = async (score) => {
    await API.post("/scores", {
      user_id: userId,
      score: Number(score)
    });
    loadData();
  };

  const selectCharity = async (id) => {
    await API.post("/select-charity", {
      user_id: userId,
      charity_id: id
    });
    loadData();
  };

  const checkResult = async () => {
    const res = await API.post("/check-result", { user_id: userId });
    setResult(res.data);
  };

  return (
    <div style={container}>
      <Navbar />

      <div style={content}>
        <h1>🎯 USER DASHBOARD</h1>

        {/*  SUBSCRIPTION */}
        <div style={card}>
          <h3>📌 Subscription</h3>
          <p>Status: {data.user?.subscription_status}</p>
          <p>Email: {data.user?.email}</p>
        </div>

        {/* SCORE ENTRY */}
        <div style={card}>
          <h3>🏌️ Score Entry</h3>
          <ScoreForm addScore={addScore} />
        </div>

        {/* SCORES LIST */}
        <div style={card}>
          <h3>Your Scores</h3>
          {data.scores?.length > 0 ? (
            data.scores.map((s) => (
              <div key={s.id}>Score: {s.score}</div>
            ))
          ) : (
            <p>No scores yet</p>
          )}
        </div>

        {/* 4️ CHARITY */}
        <div style={card}>
          <h3>❤️ Charity Selection</h3>
          <CharityList
            charities={charities}
            selectCharity={selectCharity}
          />
        </div>

        {/* 5️ PARTICIPATION */}
        <div style={card}>
          <h3>🎲 Participation</h3>
          <button style={btn} onClick={checkResult}>
            Check Result
          </button>

          {result && (
            <p>
              {result.result} (Number: {result.number})
            </p>
          )}
        </div>

        {/* 6️ WINNINGS */}
        <div style={card}>
          <h3>🏆 Winnings</h3>
          <Winnings />
        </div>

        {/* 7️ LEADERBOARD */}
        <div style={card}>
          <h3>🥇 Leaderboard</h3>
          {leaderboard.map((l, i) => (
            <div key={i}>
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
const container = {
  background: "#0f172a",
  minHeight: "100vh",
  color: "white"
};

const content = {
  padding: "20px",
  maxWidth: "800px",
  margin: "auto"
};

const card = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "20px"
};

const btn = {
  padding: "8px 12px",
  background: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};
