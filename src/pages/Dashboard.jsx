import React, { useEffect, useState } from "react";
import API from "../api/api";
import "../App.css";

import Navbar from "../components/Navbar";
import ScoreForm from "../components/ScoreForm";
import CharityList from "../components/CharityList";
import Winnings from "../components/Winnings";

function Dashboard() {
  const userId = localStorage.getItem("userId");

  const [data, setData] = useState({});
  const [charities, setCharities] = useState([]);
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const d = await API.get(`/dashboard/${userId}`);
      const c = await API.get("/charities");
      const l = await API.get("/leaderboard");

      setData(d.data);
      setCharities(c.data);
      setLeaderboard(l.data);

    } catch (err) {
      console.log(err);
    }
  };

  const subscribe = async () => {
    await API.post("/subscribe", { user_id: userId });
    loadData();
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
    <div className="container">

      {/* 🔝 Navbar */}
      <Navbar />

      <h1>🎯 Dashboard</h1>

      {/* 👤 USER INFO */}
      <div className="card">
        <p>Email: {data.user?.email}</p>
        <p>Status: {data.user?.subscription_status}</p>

        {data.user?.subscription_status !== "active" && (
          <button onClick={subscribe}>Subscribe</button>
        )}
      </div>

      {/* 🎯 SCORE FORM */}
      <ScoreForm addScore={addScore} />

      {/* 🎲 RESULT */}
      <div className="card">
        <button onClick={checkResult}>Check Result</button>

        {result && (
          <p className={result.result.includes("WIN") ? "win" : "lose"}>
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
      <div className="card">
        <h3>Leaderboard</h3>

        {leaderboard.map((l, i) => (
          <div className="item" key={i}>
            #{i + 1} {l.email} - {l.best_score}
          </div>
        ))}
      </div>

      {/* 🎁 WINNINGS */}
      <Winnings />

    </div>
  );
}

export default Dashboard;