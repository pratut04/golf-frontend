import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";


import AdminUsers from "../components/AdminUsers";
import AdminScores from "../components/AdminScores";
import AdminCharities from "../components/AdminCharities";


import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area
} from "recharts";

function Admin() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [winnings, setWinnings] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [jackpot, setJackpot] = useState(0);
  const [preview, setPreview] = useState(null);
  const [basePool, setBasePool] = useState(0);
  const BASE_URL = "https://golf-backend-new.onrender.com";
  const [simMsg, setSimMsg] = useState("");

  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [charityData, setCharityData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [simulation, setSimulation] = useState(null);
  //const COLORS = ["#8b5cf6", "#22c55e", "#facc15"];
  const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#06b6d4"];
  const maxMatch = React.useMemo(() => {
    return simulation
      ? Math.max(...simulation.results.map(r => r.matchCount))
      : 0;
  }, [simulation]);
  const navigate = useNavigate();


  const chartData = [
    { name: "Paid", value: Number(stats?.paid) || 0 },
    { name: "Pending", value: Number(stats?.pending) || 0 }
  ];

  const pieData = [
    { name: "Paid", value: Number(stats?.paid) || 0 },
    { name: "Pending", value: Number(stats?.pending) || 0 }
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // ❌ No token → logout
    if (!token) {
      navigate("/");
      return;
    }

    // ❌ Not admin → redirect
    if (role !== "admin") {
      navigate("/dashboard");
      return;
    }

    loadLeaderboard();
  }, []);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await API.get("/admin-analytics");
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadAnalytics();
  }, []);

  useEffect(() => {
    const loadCharity = async () => {
      const res = await API.get("/charity-breakdown");

      // 🔥 FIX HERE
      const formatted = res.data.map(item => ({
        ...item,
        total: Number(item.total)
      }));

      setCharityData(formatted);
    };

    loadCharity();
  }, []);

  useEffect(() => {
    const fetchJackpot = async () => {
      try {
        const res = await API.get("/jackpot");
        setJackpot(res.data.jackpot);
        setBasePool(res.data.basePool);
      } catch (err) {
        console.error(err);
      }
    };

    fetchJackpot();

    const interval = setInterval(fetchJackpot, 10000);

    return () => clearInterval(interval);
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
      // ✅ CALL BACKEND FIRST (with or without numbers)
      const res = await API.post("/draw", {
        numbers: simulation?.numbers || []   // safe fallback
      });

      alert("✅ Draw completed");
      setNumbers(res.data.numbers);

    } catch (err) {
      console.error(err);

      if (err.response) {

        const error = err.response.data.error;

        // 🔥 DRAW ALREADY DONE (priority)
        if (error?.includes("already done")) {
          alert(error);
          return;
        }

        // 🔥 SIMULATION NOT RUN
        if (!simulation || !simulation.numbers) {
          alert("⚠️ Please run simulation first");
          return;
        }

        // 🔥 OTHER ERRORS
        if (error) {
          alert(error);
        } else {
          alert("Something went wrong ❌");
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

  const loadStats = async () => {
    try {
      const res = await API.get("/admin-stats");
      setStats(res.data);
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
  }, [simulation]);


  useEffect(() => {
    if (simulation) {
      loadWinnings();   // reload 
    }
  }, [simulation]);

  useEffect(() => {
    loadStats();
  }, []);

  const approveWinning = async (id) => {
    try {
      await API.post("/approve-winning", { winning_id: id });
      loadWinnings();
    } catch (err) {
      console.error(err);
    }
  };

  const rejectWinning = async (id) => {
    try {
      await API.post("/reject-winning", { winning_id: id });
      loadWinnings(); // refresh list
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <p style={{ color: "white", textAlign: "center" }}>Loading...</p>;
  }

  const growth =
    analytics?.monthly?.length >= 2
      ? (
        ((analytics.monthly.at(-1).amount -
          analytics.monthly.at(-2).amount) /
          analytics.monthly.at(-2).amount) *
        100
      ).toFixed(1)
      : 0;


  return (
    <div style={layout}>
      {/* SIDEBAR */}
      <div style={sidebar}>
        <h2 style={{ marginBottom: "20px" }}>⚙️ Admin</h2>

        <p
          style={{
            ...navItem,
            background: location.pathname === "/admin" ? "#1e293b" : "",
            color: location.pathname === "/admin" ? "white" : ""
          }}
          onClick={() => navigate("/admin")}
        >
          📊 Dashboard
        </p>

        <p
          style={{
            ...navItem,
            background: location.pathname === "/admin/users" ? "#1e293b" : ""
          }}
          onClick={() => navigate("/admin/users")}
        >
          👥 Users
        </p>

        <p
          style={{
            ...navItem,
            background: location.pathname === "/admin/scores" ? "#1e293b" : ""
          }}
          onClick={() => navigate("/admin/scores")}
        >
          🎯 Scores
        </p>

        <p
          style={{
            ...navItem,
            background: location.pathname === "/admin/charities" ? "#1e293b" : ""
          }}
          onClick={() => navigate("/admin/charities")}
        >
          💖 Charities
        </p>

        <p
          style={{
            ...navItem,
            background: location.pathname === "/admin/winnings" ? "#1e293b" : ""
          }}
          onClick={() => navigate("/admin/winnings")}
        >
          💰 Winnings
        </p>

        <p
          style={{
            ...navItem,
            background: location.pathname === "/admin/leaderboard" ? "#1e293b" : ""
          }}
          onClick={() => navigate("/admin/leaderboard")}
        >
          🏆 Leaderboard
        </p>
      </div>

      {/* MAIN */}
      <div style={main}>
        <Navbar />

        <div style={content}>

          {location.pathname === "/admin" && (
            <>
              <h1 style={title}>Admin Dashboard</h1>


              {analytics && (
                <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>

                  <div style={statCard}>
                    <div style={statTitle}>💰 Total Earnings</div>

                    <div style={statValue}>
                      ₹{Number(analytics.totalEarnings).toLocaleString()}
                    </div>

                    <div
                      style={{
                        marginTop: "5px",
                        color: growth >= 0 ? "#16a34a" : "#dc2626",
                        fontWeight: "600"
                      }}
                    >
                      {growth >= 0 ? "🔼" : "🔽"} {growth}%
                    </div>
                  </div>

                </div>
              )}


              {/* Admin Stats */}
              {stats && (
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    flexWrap: "wrap",
                    marginBottom: "20px"
                  }}
                >

                  {/* USERS */}
                  <div
                    style={{
                      ...statCard,
                      background: "linear-gradient(135deg, #eff6ff, #dbeafe)"
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-5px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <div style={statTitle}>👥 Total Users</div>
                    <div style={statValue}>{stats.users}</div>
                  </div>

                  {/* PAID */}
                  <div
                    style={{
                      ...statCard,
                      background: "linear-gradient(135deg, #ecfdf5, #d1fae5)"
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-5px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <div style={statTitle}>💰 Paid</div>
                    <div style={statValue}>
                      ₹{Number(stats.paid).toLocaleString()}
                    </div>
                  </div>

                  {/* PENDING */}
                  <div
                    style={{
                      ...statCard,
                      background: "linear-gradient(135deg, #fef9c3, #fef08a)"
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-5px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <div style={statTitle}>⏳ Pending</div>
                    <div style={statValue}>
                      ₹{Number(stats.pending).toLocaleString()}
                    </div>
                  </div>

                  {/* TOTAL WINS */}
                  <div
                    style={{
                      ...statCard,
                      background: "linear-gradient(135deg, #f5f3ff, #ddd6fe)"
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-5px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <div style={statTitle}>🎯 Total Wins</div>
                    <div style={statValue}>{stats.totalWinnings}</div>
                  </div>

                </div>
              )}
              {/* 💖 TOTAL CHARITY */}
              <div
                style={{
                  ...statCard,
                  background: "linear-gradient(135deg, #fdf2f8, #fce7f3)"
                }}
              >
                <div style={statTitle}>💖 Charity Donations</div>
                <div style={statValue}>
                  ₹{Number(stats?.totalCharity || 0).toLocaleString()}
                </div>
              </div>

              {/* 📊 Analytics Chart */}

              {stats && (
                <div style={card}>
                  <h3>📊 Revenue Overview</h3>

                  <div style={{ width: "100%", height: "300px" }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            background: "#fff",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                          }}
                        />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.name === "Paid" ? "#22c55e" : "#facc15"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div style={card}>
                <h3>💖 Charity Breakdown</h3>

                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <PieChart>

                      {/* 🔥 GRADIENT */}
                      <defs>
                        <linearGradient id="charityGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#a78bfa" />
                          <stop offset="100%" stopColor="#6d28d9" />
                        </linearGradient>
                      </defs>

                      <Pie
                        data={charityData}
                        dataKey="total"
                        nameKey="charity_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}   // 🔥 bigger
                        label={({ value }) => `₹${value}`}   // 🔥 show ₹
                      >
                        {charityData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value) => `₹${value}`}
                        contentStyle={{
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0"
                        }}
                      />

                      <Legend />

                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 🥧 Distribution Chart */}
              {/* 🥧 Payment Distribution */}
              {stats && (
                <div style={card}>
                  <h3>💳 Payment Breakdown</h3>

                  <div style={{ width: "100%", height: "350px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={120}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#22c55e" />
                          <Cell fill="#facc15" />
                        </Pie>

                        <Tooltip
                          contentStyle={{
                            background: "#fff",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0"
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* 📈 Monthly Growth */}
              {analytics && (
                <div style={card}>
                  <h3>📈 Monthly Growth</h3>
                  <div style={{
                    display: "inline-block",
                    background: growth >= 0 ? "#dcfce7" : "#fee2e2",
                    color: growth >= 0 ? "#16a34a" : "#dc2626",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    fontWeight: "600",
                    fontSize: "13px",
                    marginBottom: "10px"
                  }}>
                    {growth >= 0 ? "📈 +" : "📉 "}
                    {growth}% from last month
                  </div>

                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.monthly}>

                        {/* 🔥 Gradient */}
                        <defs>
                          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                          </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="name" />

                        <YAxis />

                        <Tooltip />

                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#2563eb"
                          fill="url(#colorGrowth)"
                          strokeWidth={3}
                        />

                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

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
                <button className="admin-btn" onClick={runDraw}>
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

                <button className="admin-btn" onClick={runSimulation}>
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

                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        📅 {new Date(w.draw_date).toLocaleDateString("en-IN")}
                      </div>

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
                        {w.status === "paid" && "✅ Paid"}
                        {w.status === "pending" && "⏳ Pending"}
                        {w.status === "rejected" && "❌ Rejected"}
                      </span>

                      {/* {w.proof && (
                        <img
                          src={`http://localhost:5000/${w.proof}`}
                          width="80"
                          alt="proof"
                          style={{
                            marginTop: "6px",
                            borderRadius: "6px",
                            cursor: "pointer"
                          }}
                          onClick={() =>
                            setPreview(`http://localhost:5000/${w.proof}`)
                          }
                        />
                      )} */}


                      {w.proof && (
                        <img
                          src={`${BASE_URL}/${w.proof}`}
                          width="80"
                          alt="proof"
                          style={{
                            marginTop: "6px",
                            borderRadius: "6px",
                            cursor: "pointer"
                          }}
                          onClick={() =>
                            setPreview(`${BASE_URL}/${w.proof}`)
                          }
                        />
                      )}

                      {w.status === "pending" && (
                        <>
                          <button
                            className="admin-btn"
                            onClick={() => approveWinning(w.id)}
                          >
                            Approve
                          </button>

                          {/* 🔥 ADD THIS BELOW */}
                          <button
                            className="admin-btn admin-btn-danger"
                            onClick={() => rejectWinning(w.id)}
                          >
                            Reject
                          </button>
                        </>
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


              {preview && (
                <div
                  onClick={() => setPreview(null)}
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0,0,0,0.8)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 999
                  }}
                >
                  <img
                    src={preview}
                    alt="preview"
                    style={{
                      maxWidth: "90%",
                      maxHeight: "90%",
                      borderRadius: "10px",
                      boxShadow: "0 0 20px rgba(0,0,0,0.5)"
                    }}
                  />
                </div>
              )}

            </>
          )}
          <Outlet
            context={{
              winnings,
              leaderboard,
              approveWinning,
              rejectWinning
            }}
          />
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
  width: "240px",
  background: "linear-gradient(180deg, #020617, #0f172a)",
  padding: "24px 16px",
  color: "#cbd5f5",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  borderRight: "1px solid rgba(255,255,255,0.08)"
};

const navItem = {
  padding: "12px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontWeight: "500"
};

const main = {
  flex: 1,
};

const content = {
  padding: "30px",
  maxWidth: "1200px",
  margin: "auto",
};

const title = {
  fontSize: "32px",
  fontWeight: "800",
  marginBottom: "25px",
  color: "#0f172a"
};

const card = {
  background: "#ffffff",
  padding: "22px",
  borderRadius: "16px",
  marginBottom: "22px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 25px rgba(118, 93, 220, 0.06)",
  transition: "all 0.25s ease"
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid #e2e8f0",
};

const btn = {
  padding: "10px 18px",
  background: "linear-gradient(135deg, #4f46e5, #6366f1)",
  border: "none",
  borderRadius: "10px",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
  boxShadow: "none",
  transition: "0.2s"
};


const statCard = {
  flex: "1",
  minWidth: "200px",
  padding: "22px",
  borderRadius: "16px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  transition: "all 0.25s ease"
};

const statTitle = {
  fontSize: "14px",
  color: "#64748b",
  marginBottom: "6px"
};

const statValue = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#0f172a"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  marginBottom: "25px"
};