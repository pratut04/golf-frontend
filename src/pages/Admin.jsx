import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

import AdminUsers from "../components/AdminUsers";
import AdminScores from "../components/AdminScores";
import AdminCharities from "../components/AdminCharities";

function Admin() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [winnings, setWinnings] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [jackpot, setJackpot] = useState(0);
  const [basePool, setBasePool] = useState(0);
  const [simMsg, setSimMsg] = useState("");
  const [simulation, setSimulation] = useState(null);
  const maxMatch = simulation
    ? Math.max(...simulation.results.map(r => r.matchCount))
    : 0;

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

  useEffect(() => {
    fetch("https://golf-backend-new.onrender.com/jackpot") //("http://localhost:5000/jackpot")
      .then(res => res.json())
      .then(data => {
        setJackpot(data.jackpot);
        setBasePool(data.basePool); // ✅ IMPORTANT
      })
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


  // const runDraw = async () => {
  //   try {
  //     const res = await API.post("/draw");

  //     alert("✅ Draw completed");

  //     // ✅ set numbers properly
  //     setNumbers(res.data.numbers);

  //   } catch (err) {
  //     console.error(err);

  //     if (err.response) {
  //       if (err.response.data.numbers) {

  //         // ✅ show message WITH numbers
  //         alert(
  //           `⚠️ Draw already done this month\nNumbers: ${err.response.data.numbers.join(", ")}`
  //         );

  //         // ✅ STILL SHOW NUMBERS IN UI
  //         setNumbers(err.response.data.numbers);

  //       } else {
  //         alert(err.response.data.error);
  //       }
  //     } else {
  //       alert("Server error");
  //     }
  //   }
  // };
  const runDraw = async () => {
    // ❗ simulation check (OUTSIDE try — best practice)
    if (!simulation || !simulation.numbers) {
      alert("⚠️ Please run simulation first");
      return;
    }

    try {
      // ✅ use simulation numbers
      const res = await API.post("/draw", {
        numbers: simulation.numbers
      });

      alert("✅ Draw completed");

      // ✅ update UI
      setNumbers(res.data.numbers);

    } catch (err) {
      console.error(err);

      if (err.response) {
        if (err.response.data.numbers) {

          alert(
            `⚠️ Draw already done this month\nNumbers: ${err.response.data.numbers.join(", ")}`
          );

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


  const runSimulation = async () => {
    try {
      const res = await API.post("/simulate-draw");

      setSimulation(res.data);

      setSimMsg("🧪 Simulation complete"); // ✅ message set

      // auto hide after 3 sec
      setTimeout(() => setSimMsg(""), 3000);

    } catch (err) {
      console.error(err);
      setSimMsg("❌ Simulation failed");

      setTimeout(() => setSimMsg(""), 3000);
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


          <div style={card}>
            <h3>💰 Jackpot</h3>

            <p style={{ fontSize: "22px", fontWeight: "bold" }}>
              ₹{Number(jackpot).toLocaleString()}
            </p>

            <small>
              💰 Next Match Pool: ₹{
                Math.floor(Number(jackpot) + (Number(basePool) * 0.4))
              }
            </small>
          </div>

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
          {/* 🧪 SIMULATION */}
          <div style={card}>
            <h3>🧪 Simulation</h3>
            {simMsg && (
              <div style={{
                background: "#ecfdf5",
                color: "#065f46",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "10px",
                fontWeight: "500"
              }}>
                {simMsg}
              </div>
            )}

            <button style={btn} onClick={runSimulation}>
              🎲 Simulate Draw
            </button>

            {simulation && (

              <div style={{ marginTop: "10px" }}>
                <p><b>Numbers:</b> {simulation.numbers.join(", ")}</p>

                <h4>Results:</h4>

                <p><b>Pool:</b> ₹{simulation.poolAmount}</p>

                {simulation.results.map((r, i) => (
                  <div key={i} style={{
                    background: r.matchCount === maxMatch ? "#dcfce7" : "transparent",
                    padding: "8px",
                    borderRadius: "8px",
                    marginBottom: "6px",
                    border: r.matchCount === maxMatch ? "1px solid #22c55e" : "none"
                  }}>
                    🧑 {r.email} → 🎯 Matches: {r.matchCount}

                    {r.matchCount >= 3 && (
                      <span style={{ marginLeft: "10px", color: "#16a34a", fontWeight: "600" }}>
                        💰 ₹{r.prize}
                      </span>
                    )}

                    {r.matchCount === maxMatch && r.matchCount > 0 && (
                      <span style={{ marginLeft: "10px" }}>
                        🏆 Winner
                      </span>
                    )}
                  </div>
                ))}
              </div>
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
                    {w.match_type}
                  </small>

                  <div style={{ fontWeight: "600" }}>
                    ₹{Number(w.amount).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      color:
                        w.status === "paid" ? "#22c55e" : "#facc15",
                      marginRight: "10px",
                    }}
                  >
                    {w.status === "paid" ? "✅ Paid" : "⏳ Pending"}
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
