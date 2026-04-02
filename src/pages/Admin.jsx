import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

import AdminUsers from "../components/AdminUsers";
import AdminScores from "../components/AdminScores";
import AdminCharities from "../components/AdminCharities";

function Admin() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [drawResult, setDrawResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [winnings, setWinnings] = useState([]);
  const [numbers, setNumbers] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    if (!token) {
      navigate("/");
      return;
    }

    if (email !== "secure@gmail.com") {
      navigate("/dashboard");
      return;
    }

    loadLeaderboard();
  }, []);

  useEffect(() => {
    loadLatestDraw();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await API.get("/leaderboard");
      setLeaderboard(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const runDraw = async () => {
    try {
      const res = await API.post("/draw");

      alert("✅ Draw completed");

      // ✅ set numbers properly
      setNumbers(res.data.numbers);

    } catch (err) {
      console.error(err);

      if (err.response) {
        if (err.response.data.numbers) {

          // ✅ show message WITH numbers
          alert(
            `⚠️ Draw already done this month\nNumbers: ${err.response.data.numbers.join(", ")}`
          );

          // ✅ STILL SHOW NUMBERS IN UI
          setNumbers(err.response.data.numbers);

        } else {
          alert(err.response.data.error);
        }
      } else {
        alert("Server error");
      }
    }
  };


   const loadLatestDraw = async () => {
      try {
        const res = await API.get("/latest-draw");

        if (res.data.numbers && res.data.numbers.length > 0) {
          setNumbers(res.data.numbers);
        }
      } catch (err) {
        console.error(err);
      }
    };

  const loadWinnings = async () => {
    try {
      const res = await API.get("/all-winnings");
      setWinnings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadWinnings();
  }, []);

  const approveWinning = async (id) => {
    try {
      await API.post("/approve-winning", { winning_id: id });
      loadWinnings();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <p style={{ color: "white", textAlign: "center" }}>Loading...</p>;
  }

  return (
    <div style={layout}>
      {/* SIDEBAR */}
      <div style={sidebar}>
        <h2 style={{ marginBottom: "20px" }}>⚙️ Admin</h2>

        <p style={navItem}>Dashboard</p>
        <p style={navItem}>Users</p>
        <p style={navItem}>Scores</p>
        <p style={navItem}>Charities</p>
        <p style={navItem}>Winnings</p>
        <p style={navItem}>Leaderboard</p>

      </div>

      {/* MAIN */}
      <div style={main}>
        <Navbar />

        <div style={content}>
          <h1 style={title}>Admin Dashboard</h1>

          {/* DRAW */}
          <div style={card}>
            <h3>🎲 Draw Management</h3>
            <button style={btn} onClick={runDraw}>
              Run Draw
            </button>

            {numbers.length > 0 && (
              <p style={{ marginTop: "10px", fontWeight: "bold" }}>
                🎯Monthly Draw: {numbers.join(", ")}
              </p>
            )}
          </div>

          {/* MANAGEMENT */}
          <div style={card}>
            <h3>📊 Management</h3>
            <AdminUsers />
            <AdminScores />
            <AdminCharities />
          </div>

          {/* WINNINGS */}
          <div style={card}>
            <h3>💰 Winnings</h3>

            {winnings.map((w) => (
              <div key={w.id} style={row}>
                <div>
                  <div>{w.email}</div>
                  <small style={{ color: "#9ca3af" }}>
                    ₹{w.amount}
                  </small>
                </div>

                <div>
                  <span
                    style={{
                      color:
                        w.status === "paid" ? "#22c55e" : "#facc15",
                      marginRight: "10px",
                    }}
                  >
                    {w.status}
                  </span>

                  {w.status === "pending" && (
                    <button
                      style={btn}
                      onClick={() => approveWinning(w.id)}
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* LEADERBOARD */}
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
        </div>
      </div>
    </div>
  );
}

export default Admin;

//
// 🎨 CLEAN LIGHT ADMIN STYLES
//

const layout = {
  display: "flex",
  minHeight: "100vh",
  background: "#f8fafc",   // ✅ clean light
  color: "#0f172a"
};

const sidebar = {
  width: "220px",
  background: "#ffffff",   // ✅ white sidebar
  padding: "20px",
  borderRight: "1px solid #e2e8f0"
};

const navItem = {
  padding: "10px 12px",
  color: "#334155",
  cursor: "pointer",
  borderRadius: "8px",
  marginBottom: "6px",
  transition: "0.2s"
};

const main = {
  flex: 1,
};

const content = {
  padding: "30px",
  maxWidth: "1000px",
  margin: "auto",
};

const title = {
  fontSize: "30px",
  fontWeight: "700",
  marginBottom: "25px",
  color: "#0f172a"
};

const card = {
  background: "#ffffff",   // ✅ white card
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "20px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid #e2e8f0",
};

const btn = {
  padding: "10px 16px",
  background: "#2563eb",   // ✅ professional blue
  border: "none",
  borderRadius: "8px",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
  boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
  transition: "0.2s"
};
