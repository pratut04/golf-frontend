import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

import AdminUsers from "../components/AdminUsers";
import AdminScores from "../components/AdminScores";
import AdminCharities from "../components/AdminCharities";
import KpiCard from "../components/KpiCard";


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


import {
  IndianRupee,
  Wallet,
  TrendingUp,
  Users,
  Clock,
  Trophy,
  Heart
} from "lucide-react";

function Admin() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [winnings, setWinnings] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [jackpot, setJackpot] = useState(0);
  const [preview, setPreview] = useState(null);
  const [basePool, setBasePool] = useState(0);
  //const BASE_URL = "https://golf-backend-new.onrender.com";
  const [simMsg, setSimMsg] = useState("");
  const showToast = (type, message, id) => {
    if (!toast.isActive(id || message)) {
      toast[type](message, {
        toastId: id || message,
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

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


  const chartData = analytics?.monthly || [];
  //   const chartData = [
  //   { name: "Mar 2026", earnings: 300, payouts: 100, profit: 200 },
  //   { name: "Apr 2026", earnings: 200, payouts: 465, profit: -265 }
  // ];
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

      const formatted = res.data.data.map(item => ({
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
      setLeaderboard(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  // const runDraw = async () => {
  //   try {
  //     // ✅ CALL BACKEND FIRST (with or without numbers)
  //     const res = await API.post("/draw", {
  //       numbers: simulation?.numbers || []   // safe fallback
  //     });

  //     alert("✅ Draw completed");
  //     setNumbers(res.data.numbers);

  //   } catch (err) {
  //     console.error(err);

  //     if (err.response) {

  //       const error = err.response.data.error;

  //       // 🔥 DRAW ALREADY DONE (priority)
  //       if (error?.includes("already done")) {
  //         alert(error);
  //         return;
  //       }

  //       // 🔥 SIMULATION NOT RUN
  //       if (!simulation || !simulation.numbers) {
  //         alert("⚠️ Please run simulation first");
  //         return;
  //       }

  //       // 🔥 OTHER ERRORS
  //       if (error) {
  //         alert(error);
  //       } else {
  //         alert("Something went wrong ❌");
  //       }

  //     } else {
  //       alert("Server error");
  //     }
  //   }
  // };

  const runDraw = async () => {
    try {
      const res = await API.post("/draw", {
        numbers: simulation?.numbers || []
      });

      showToast("success", "Draw completed 🎯");
      setNumbers(res.data.numbers);

    } catch (err) {
      const errData = err.response?.data;

      if (err.response?.status === 400) {
        if (errData?.code === "DRAW_ALREADY_DONE") {
          showToast("warning", errData.message);
        } else if (errData?.code === "INVALID_COUNT") {
          showToast("error", "Enter exactly 5 numbers");
        } else if (errData?.code === "INVALID_RANGE") {
          showToast("error", "Numbers must be 1–45");
        } else {
          showToast("error", errData?.message || "Draw failed");
        }

      } else if (err.response?.status === 403) {
        showToast("error", "Admin access required");

      } else {
        showToast("error", "Server error ❌");
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
      showToast("error", "Failed to load stats");
    }
  };

  const runSimulation = async () => {
    try {
      const res = await API.post("/simulate-draw");

      setSimulation(res.data);
      showToast("success", "Simulation complete 🧪");

    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || "Simulation failed "
      );
    }
  };

  const loadWinnings = async () => {
    try {
      const res = await API.get("/all-winnings");
      setWinnings(res.data.data);
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

      showToast("success", "Winning approved ✅");
      loadWinnings();

    } catch (err) {
      const errData = err.response?.data;

      showToast(
        "error",
        errData?.message || "Approval failed ❌"
      );
    }
  };

  const rejectWinning = async (id) => {
    try {
      await API.post("/reject-winning", { winning_id: id });

      showToast("warning", "Winning rejected ❌");
      loadWinnings();

    } catch (err) {
      const errData = err.response?.data;

      showToast(
        "error",
        errData?.message || "Reject failed ❌"
      );
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid #e5e7eb",
          borderTop: "4px solid #6366f1",
          borderRadius: "50%",
          margin: "auto",
          animation: "spin 1s linear infinite"
        }} />
      </div>
    );
  }

  const growth =
    analytics?.monthly?.length >= 2
      ? (
        ((analytics.monthly.at(-1).revenue -
          analytics.monthly.at(-2).revenue) /
          (analytics.monthly.at(-2).revenue || 1)) * 100
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

              {/* 


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
              )} */}
              <div
                style={{
                  ...kpiGrid,
                  gridTemplateColumns: "repeat(4, 1fr)" // fixed 4 columns
                }}
              >

                {/* 🔥 FULL WIDTH CARD */}
                <div style={{ gridColumn: "span 4" }}>
                  <KpiCard
                    title="Total Earnings"
                    value={analytics?.totalEarnings || 0}
                    icon={IndianRupee}
                    highlight
                    isCurrency
                  />
                </div>

                {/* 🔽 NORMAL GRID CARDS */}
                <KpiCard
                  title="Total Payout"
                  value={analytics?.totalPaid || 0}
                  icon={Wallet}
                  isCurrency
                />

                <KpiCard
                  title="Net Profit"
                  value={analytics?.profit || 0}
                  icon={TrendingUp}
                  positive={analytics?.profit >= 0}
                  isCurrency
                />

                <KpiCard
                  title="Total Users"
                  value={stats?.users || 0}
                  icon={Users}
                />

                <KpiCard
                  title="Paid"
                  value={stats?.paid || 0}
                  icon={IndianRupee}
                  positive
                  isCurrency
                />

                <KpiCard
                  title="Pending"
                  value={stats?.pending || 0}
                  icon={Clock}
                  warning
                  isCurrency
                />

                <KpiCard
                  title="Total Wins"
                  value={stats?.totalWinnings || 0}
                  icon={Trophy}
                />

                <KpiCard
                  title="Charity Donations"
                  value={stats?.totalCharity || 0}
                  icon={Heart}
                  isCurrency
                />

              </div>


              {/* 📊 Analytics Chart */}

              {analytics && (
                <div style={card}>
                  <h3>📊 Revenue Overview</h3>

                  <div style={{ width: "100%", height: "300px" }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />

                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "total_pool") return [`₹${value}`, "Total Pool"];
                            if (name === "paid") return [`₹${value}`, "Paid"];
                            return [`₹${value}`, name];
                          }}
                          contentStyle={{
                            background: "#fff",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0"
                          }}
                        />

                        {/* 🟢 Earnings */}
                        <Bar dataKey="total_pool" fill="#22c55e" />
                        <Bar dataKey="paid" fill="#ef4444" />
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
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: growth >= 0 ? "#dcfce7" : "#fee2e2",
                    color: growth >= 0 ? "#16a34a" : "#dc2626",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    fontWeight: "600",
                    fontSize: "13px"
                  }}>
                    {growth >= 0 ? "📈 +" : "📉 "}
                    {growth}%
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
                          dataKey="revenue"
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
                  💰 Estimated Next Jackpot: ₹{
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

                    <div>
                      <p><strong>Base Pool:</strong> ₹{simulation.basePool}</p>
                      <p><strong>Jackpot:</strong> ₹{simulation.jackpot}</p>
                      <p><strong>Total Pool:</strong> ₹{simulation.totalPool}</p>
                    </div>

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

                      {w.proof && (
                        <img
                          src={w.proof}
                          width="80"
                          alt="proof"
                          style={{
                            marginTop: "6px",
                            borderRadius: "6px",
                            cursor: "pointer"
                          }}
                          onClick={() => setPreview(w.proof)}
                        />
                      )}


                      {/* {w.proof && (
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
                      )}  */}

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
  maxWidth: "1400px",
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

const proCard = {
  padding: "20px",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #ffffff, #f8fafc)",
  border: "1px solid #e5e7eb",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  transition: "0.25s",
};

const proLabel = {
  fontSize: "13px",
  color: "#64748b",
  marginBottom: "8px"
};

const proValue = {
  fontSize: "26px",
  fontWeight: "700",
  color: "#0f172a"
};


const proGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginBottom: "25px"
};

const highlightCard = {
  background: "linear-gradient(135deg, #4f46e5, #6366f1)",
  color: "white",
  boxShadow: "0 12px 30px rgba(99,102,241,0.3)",
  transform: "scale(1.02)"
};

const growthBadge = {
  marginTop: "8px",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  background: "rgba(255,255,255,0.2)",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px"
};



const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
  marginBottom: "30px",
  alignItems: "stretch"
};