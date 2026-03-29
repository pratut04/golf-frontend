import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

import ScoreForm from "../components/ScoreForm";
import CharityList from "../components/CharityList";
import Winnings from "../components/Winnings";

function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState({});
  const [charities, setCharities] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    // 🔐 PROTECTION
    if (!token) {
      navigate("/");
      return;
    }

    if (!userId) {
      console.error("❌ No userId found");
      navigate("/");
      return;
    }

    loadData(userId);
  }, []);

  const loadData = async (userId) => {
    try {
      const d = await API.get(`/dashboard/${userId}`);
      const c = await API.get("/charities");
      const l = await API.get("/leaderboard");

      setData(d.data);
      setCharities(c.data);
      setLeaderboard(l.data);

    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };

  // ✅ ADD SCORE
  const addScore = async (score, date) => {
    try {
      const userId = localStorage.getItem("userId");

      const newScore = {
        id: Date.now(),
        score: Number(score),
        created_at: date
      };

      // 🔥 instant UI update
      setData(prev => ({
        ...prev,
        scores: [newScore, ...(prev.scores || [])].slice(0, 5)
      }));

      await API.post("/scores", {
        user_id: userId,
        score: Number(score),
        created_at: date
      });

      alert("✅ Score added");

      loadData(userId); // refresh

    } catch (err) {
      console.error(err);
      alert("❌ Error adding score");
    }
  };

  // ✅ SELECT CHARITY
  const selectCharity = async (id) => {
    try {
      const userId = localStorage.getItem("userId");

      await API.post("/select-charity", {
        user_id: userId,
        charity_id: id
      });

      alert("Charity selected ✅");
      loadData(userId);

    } catch (err) {
      console.error("CHARITY ERROR:", err);
    }
  };

  // ✅ DRAW RESULT
  const checkResult = async () => {
    try {
      const userId = localStorage.getItem("userId");

      const res = await API.post("/check-result", {
        user_id: userId
      });

      setResult(res.data);

    } catch (err) {
      console.error("DRAW ERROR:", err);
    }
  };

  // 🔥 LOADING FIX
  if (!data.user) {
    return (
      <p style={{ color: "white", textAlign: "center" }}>
        Loading...
      </p>
    );
  }

  return (
    <div style={container}>
      <Navbar />

      <div style={content}>
        <h1>🎯 USER DASHBOARD</h1>

        {/* SUBSCRIPTION */}
        <div style={card}>
          <h3>📌 Subscription</h3>
          <p>Status: {data.user.subscription_status || "N/A"}</p>
          <p>Email: {data.user.email}</p>
        </div>

        {/* SCORE ENTRY */}
        <div style={card}>
          <h3>🏌️ Enter Score</h3>
          <ScoreForm addScore={addScore} />
        </div>

        {/* SCORES */}
        <div style={card}>
          <h3>📊 Last 5 Scores</h3>

          {data.scores?.length > 0 ? (
            data.scores.map((s) => (
              <div key={s.id} style={item}>
                {s.score} |{" "}
                {s.created_at
                  ? new Date(s.created_at).toLocaleDateString()
                  : "Invalid Date"}
              </div>
            ))
          ) : (
            <p>No scores yet</p>
          )}
        </div>

        {/* CHARITY */}
        <div style={card}>
          <h3>❤️ Charity Selection</h3>

          <p>
            Selected:{" "}
            <b>{data.user.charity_name || "Not selected"}</b>
          </p>

          <CharityList
            charities={charities}
            selectCharity={selectCharity}
            selectedId={data.user.charity_id}
          />
        </div>

        {/* PARTICIPATION */}
        <div style={card}>
          <h3>📊 Participation</h3>
          <p>Total Scores Entered: {data.scores?.length || 0}</p>
        </div>

        {/* DRAW */}
        <div style={card}>
          <h3>🎲 Draw & Result</h3>

          <button style={btn} onClick={checkResult}>
            Check Result
          </button>

          {result && (
            <div style={{ marginTop: "10px" }}>
              <p>Result: {result.result}</p>
              <p>Number: {result.number}</p>
            </div>
          )}
        </div>

        {/* WINNINGS */}
        <Winnings winnings={data.winnings || []} />

        {/* LEADERBOARD */}
        <div style={card}>
          <h3>🥇 Leaderboard</h3>

          {leaderboard.length > 0 ? (
            leaderboard.map((l, i) => (
              <div key={i} style={item}>
                #{i + 1} {l.email} → {l.best_score}
              </div>
            ))
          ) : (
            <p>No leaderboard data</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

// 🎨 styles
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
