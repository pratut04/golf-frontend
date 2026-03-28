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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //  protect route
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const d = await API.get(`/dashboard/${userId}`);
      const c = await API.get("/charities");
      const l = await API.get("/leaderboard");

      setData(d.data);
      setCharities(c.data);
      setLeaderboard(l.data);

    } catch (err) {
      console.error("LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  //  subscribe
  const subscribe = async () => {
    await API.post("/subscribe", { user_id: userId });
    loadData();
  };

  //  add score
  const addScore = async (score) => {
    await API.post("/scores", {
      user_id: userId,
      score: Number(score)
    });
    loadData();
  };

  // select charity
  const selectCharity = async (id) => {
    await API.post("/select-charity", {
      user_id: userId,
      charity_id: id
    });
    loadData();
  };

  //  check result
  const checkResult = async () => {
    const res = await API.post("/check-result", { user_id: userId });
    setResult(res.data);
  };

  // loading screen
  if (loading) {
    return <h2 style={{ color: "white", padding: "20px" }}>Loading...</h2>;
  }

  return (
    <div style={{ color: "white" }}>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>🎯 Dashboard</h1>

        {/* USER INFO */}
        <div style={card}>
          <p><b>Email:</b> {data.user?.email}</p>
          <p><b>Status:</b> {data.user?.subscription_status}</p>

          {data.user?.subscription_status !== "active" && (
            <button style={btn} onClick={subscribe}>
              Subscribe
            </button>
          )}
        </div>

        {/* 🎯 SCORE FORM */}
        <ScoreForm addScore={addScore} />

        {/* 🎲 RESULT */}
        <div style={card}>
          <button style={btn} onClick={checkResult}>
            Check Result
          </button>

          {result && (
            <p style={{ marginTop: "10px" }}>
              {result.result} (Number: {result.number})
            </p>
          )}
        </div>

        {/* ❤️ CHARITIES */}
        <CharityList
          charities={charities}
          selectCharity={selectCharity}
        />

        {/* 🏆 LEADERBOARD */}
        <div style={card}>
          <h3>🏆 Leaderboard</h3>

          {leaderboard.length === 0 ? (
            <p>No data</p>
          ) : (
            leaderboard.map((l, i) => (
              <div key={i}>
                #{i + 1} {l.email} → {l.best_score}
              </div>
            ))
          )}
        </div>

        {/*  WINNINGS */}
        <Winnings />

      </div>
    </div>
  );
}

export default Dashboard;

// 🎨 styles
const card = {
  background: "#1e1e1e",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "15px",
  color: "white"
};

const btn = {
  padding: "8px 12px",
  background: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};
