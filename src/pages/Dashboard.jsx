import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";
import ScoreForm from "../components/ScoreForm";
import CharityList from "../components/CharityList";
import Winnings from "../components/Winnings";
import { toast } from "react-toastify";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [charities, setCharities] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [result, setResult] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("active");
  const [jackpot, setJackpot] = useState(0);
  const [basePool, setBasePool] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (data?.user?.charity_id) {
      setSelectedId(data.user.charity_id);
    }
  }, [data]);

  const showToast = (type, message, id) => {
    if (!toast.isActive(id || message)) {
      toast[type](message, {
        toastId: id || message,
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    const checkAndLoad = async () => {
      const token = localStorage.getItem("token");
      const isGuest =
        localStorage.getItem("guest") === "true" &&
        !localStorage.getItem("token");

      if (!token && !isGuest) {
        navigate("/");
        return;
      }

      if (isGuest) {
        setSubscriptionStatus("inactive");
        loadData();
        return;
      }

      try {
        const res = await API.post("/check-subscription");
        setSubscriptionStatus(res.data.status);
        loadData();
      } catch (err) {
        showToast(
          "error",
          err.response?.data?.message || "Failed to verify subscription"
        );
      }
    };

    checkAndLoad();

    const interval = setInterval(() => {
      const isGuest =
        localStorage.getItem("guest") === "true" &&
        !localStorage.getItem("token");

      if (isGuest) {
        loadData();
      } else {
        const userId = localStorage.getItem("userId");
        if (userId) {
          loadData();
          setRefresh((prev) => !prev);
        }
      }
    }, 15000);

    return () => clearInterval(interval);
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

  const loadData = async () => {
    const isGuest =
      localStorage.getItem("guest") === "true" &&
      !localStorage.getItem("token");

    if (isGuest) {
      setSubscriptionStatus("inactive");
      try {
        const [c, l] = await Promise.all([
          API.get("/charities"),
          API.get("/leaderboard"),
        ]);
        setCharities(c.data.data);
        setLeaderboard(l.data.data || []);
      } catch (err) {
        showToast("error", "Failed to load data");
      }

      setData({
        user: { email: "Guest User", charity_name: null },
        scores: [],
        winnings: [],
      });
      return;
    }

    try {
      const d = await API.get("/dashboard");
      const allScores = d.data.scores || [];
      const sortedScores = allScores.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      const latestFiveScores = sortedScores.slice(0, 5);
      setData({ ...d.data, scores: latestFiveScores });

      const c = await API.get("/charities");
      const l = await API.get("/leaderboard");
      setCharities(c.data.data);
      setLeaderboard(l.data.data || []);
    } catch (err) {
      console.error("LOAD ERROR:", err);
      showToast(
        "error",
        err.response?.data?.message || "Failed to load dashboard"
      );
    }
  };

  // ---------- Loading ----------
  if (!data) {
    return (
      <div className="db-container">
        <Navbar />
        <div className="db-loading">
          <div className="db-spinner" />
          <p style={{ color: "#64748b", fontFamily: "Inter, sans-serif" }}>
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  if (data.success === false) {
    return (
      <div className="db-container">
        <Navbar />
        <p style={{ color: "red", textAlign: "center", padding: "40px" }}>
          Failed to load dashboard ❌ (check backend)
        </p>
      </div>
    );
  }

  if (!data.user) {
    return (
      <div className="db-container">
        <Navbar />
        <p style={{ color: "#64748b", textAlign: "center", padding: "40px" }}>
          No user data found ❌
        </p>
      </div>
    );
  }

  const isGuest =
    localStorage.getItem("guest") === "true" &&
    !localStorage.getItem("token");

  // ---------- addScore ----------
  const addScore = async (score) => {
    try {
      if (isGuest) {
        showToast("warning", "Login required to add score");
        return;
      }
      await API.post("/scores", { score: Number(score) });
      showToast("success", "Score added successfully 🎯");
      loadData();
    } catch (err) {
      const errData = err.response?.data;
      if (err.response?.status === 403) {
        if (errData?.code === "NOT_SUBSCRIBED") {
          showToast("warning", "Please subscribe first 💳");
        } else if (errData?.code === "SUBSCRIPTION_EXPIRED") {
          showToast("error", "Subscription expired");
        } else {
          showToast("error", "Access denied");
        }
      } else {
        showToast("error", errData?.message || "Something went wrong");
      }
    }
  };

  // ---------- selectCharity ----------
  const selectCharity = async (id) => {
    try {
      if (isGuest) {
        showToast("warning", "Login required to select charity");
        return;
      }
      setSelectedId(id);
      await API.post("/select-charity", { charity_id: id });
      showToast("success", "Charity selected ❤️");

      const selected = charities.find((c) => c.id === id);
      setData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          charity_id: id,
          charity_name: selected?.name || prev.user.charity_name,
        },
      }));
    } catch (err) {
      const errData = err.response?.data;
      setSelectedId(data?.user?.charity_id || null);

      if (err.response?.status === 403) {
        if (errData?.code === "NOT_SUBSCRIBED") {
          showToast("warning", "Please subscribe first 💳");
        } else if (errData?.code === "SUBSCRIPTION_EXPIRED") {
          showToast(
            "error",
            `Subscription Expired on ${new Date(errData.expiry).toLocaleDateString("en-IN")}`
          );
        } else {
          showToast("error", "Access denied");
        }
      } else if (errData?.code === "ALREADY_SELECTED") {
        setSelectedId(id);
        showToast("info", "Already selected ✅");
      } else {
        showToast("error", errData?.message || "Something went wrong");
      }
    }
  };

  // ---------- checkResult ----------
  const checkResult = async () => {
    try {
      const subRes = await API.post("/check-subscription");
      const { status, subscription_end } = subRes.data;

      if (status === "inactive") {
        if (subscription_end) {
          showToast(
            "error",
            `Expired on ${new Date(subscription_end).toLocaleDateString("en-IN")}`
          );
        } else {
          showToast("warning", "Please subscribe to check results");
        }
        return;
      }

      const res = await API.post("/check-result");
      setResult(res.data);
      showToast("success", "Result loaded 🎯");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Something went wrong");
      setResult(null);
    }
  };

  // =====================================================
  //  RENDER
  // =====================================================
  return (
    <div className="db-container">
      <Navbar />

      <div className="db-content">

        {/* ---- HERO BANNER ---- */}
        <div className="db-hero">
          <div>
            <h1 className="db-hero-title">Golf Performance Hub</h1>
            <p className="db-hero-tagline">Play smarter. Track better. Win bigger.</p>
          </div>
          <div className="db-hero-badge">🚀 Live Dashboard</div>
        </div>

        {/* ---- GUEST BANNER ---- */}
        {isGuest && (
          <div className="db-guest-banner">
            <p>🔒 You are in Guest Mode — limited access</p>
            <button onClick={() => navigate("/")}>Login to Unlock Features</button>
          </div>
        )}

        {/* ---- TOP ROW: Subscription + Score ---- */}
        <div className="db-grid-2">

          {/* Subscription Card */}
          <div className="db-card">
            <h3>📌 Subscription</h3>
            <p className="db-label">
              Email: <span className="db-value">{data.user.email}</span>
            </p>

            {subscriptionStatus !== "active" ? (
              <>
                <p className="db-label">
                  Status:{" "}
                  <span className="db-status-inactive">Not Subscribed</span>
                </p>

                {data.user.subscription_end && (
                  <p className="db-label">
                    Last expiry:{" "}
                    <span className="db-value">
                      {new Date(data.user.subscription_end).toLocaleDateString()}
                    </span>
                  </p>
                )}

                <button
                  className="db-btn-primary"
                  style={{ marginTop: "12px" }}
                  onClick={() => {
                    if (isGuest) {
                      showToast("warning", "Please sign in to continue");
                      setTimeout(() => navigate("/"), 200);
                    } else {
                      navigate("/subscription");
                    }
                  }}
                >
                  💳 Subscribe Now
                </button>
              </>
            ) : (
              <div style={{ lineHeight: "1.9" }}>
                <p className="db-label">
                  Status: <span className="db-status-active">Active ✅</span>
                </p>
                <p className="db-label">
                  Plan:{" "}
                  <span className="db-value">
                    {data.user.subscription_type === "yearly"
                      ? "Yearly Plan 🏆"
                      : "Monthly Plan 📅"}
                  </span>
                </p>
                <p className="db-label">
                  Expiry:{" "}
                  <span className="db-value">
                    {new Date(data.user.subscription_end).toLocaleDateString()}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Score Entry Card */}
          <div className="db-card">
            <h3>🏌️ Enter Score</h3>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  opacity: isGuest ? 0.6 : 1,
                  filter: isGuest ? "blur(1.5px)" : "none",
                }}
              >
                <ScoreForm
                  addScore={addScore}
                  subscriptionStatus={subscriptionStatus}
                  subscriptionEnd={data.user.subscription_end}
                  refresh={refresh}
                />
              </div>
              {isGuest && (
                <div className="db-overlay" onClick={() => navigate("/")}>
                  🔒 Sign in to record your score
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---- JACKPOT CARD ---- */}
        <div className="db-jackpot-card">
          <h3>💰 Jackpot</h3>
          <div className="db-jackpot-amount">
            ₹{Number(jackpot).toLocaleString()}
          </div>
          <p className="db-jackpot-sub">5 match prize = jackpot + 40% of pool</p>
          <p className="db-jackpot-next">
            🏆 Estimated Next Jackpot: ₹
            {Math.floor(Number(jackpot) + Number(basePool) * 0.4).toLocaleString()}
          </p>
        </div>

        {/* ---- MIDDLE ROW: Scores + Participation ---- */}
        <div className="db-grid-2">

          {/* Last 5 Scores */}
          <div className="db-card">
            <h3>📊 Last 5 Scores</h3>
            {data.scores?.length > 0 ? (
              data.scores.map((s) => (
                <div key={s.id} className="db-score-item">
                  <span style={{ fontWeight: 600 }}>🎯 {s.score}</span>
                  <span style={{ color: "#64748b", fontSize: "13px" }}>
                    {s.created_at
                      ? new Date(s.created_at).toLocaleDateString()
                      : "Invalid Date"}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                No scores recorded yet
              </p>
            )}
          </div>

          {/* Participation */}
          <div className="db-card">
            <h3>📈 Participation</h3>
            <p className="db-label">
              Total Scores Entered:{" "}
              <span className="db-value" style={{ fontSize: "24px" }}>
                {data.scores?.length || 0}
              </span>
            </p>

            {/* Draw & Result */}
            <div style={{ marginTop: "16px" }}>
              <h3 style={{ marginBottom: "10px" }}>🎲 Draw & Result</h3>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    opacity: isGuest ? 0.6 : 1,
                    filter: isGuest ? "blur(1.5px)" : "none",
                  }}
                >
                  <button className="db-btn-secondary" onClick={checkResult}>
                    Check Result
                  </button>

                  {result && subscriptionStatus === "active" && (
                    <div
                      style={{
                        marginTop: "12px",
                        lineHeight: "1.7",
                        fontSize: "14px",
                      }}
                    >
                      <p className="db-label">
                        Result:{" "}
                        <span className="db-value">{result.result}</span>
                      </p>
                      <p className="db-label">
                        Numbers:{" "}
                        <span className="db-value">
                          {result.numbers?.join(", ")}
                        </span>
                      </p>
                      <p className="db-label">
                        Draw Date:{" "}
                        <span className="db-value">
                          {new Date(result.created_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {isGuest && (
                  <div className="db-overlay" onClick={() => navigate("/")}>
                    🔒 Sign in to continue
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ---- CHARITY SELECTION ---- */}
        <div className="db-card">
          <h3>❤️ Charity Selection</h3>
          <p className="db-label">
            Selected:{" "}
            <span style={{ color: "#16a34a", fontWeight: 600 }}>
              {data.user.charity_name || "Not selected"}
            </span>
          </p>
          <div style={{ position: "relative" }}>
            <div
              style={{
                opacity: isGuest ? 0.6 : 1,
                filter: isGuest ? "blur(1.5px)" : "none",
              }}
            >
              <CharityList
                charities={charities}
                selectCharity={selectCharity}
                selectedId={data.user?.charity_id}
              />
            </div>
            {isGuest && (
              <div className="db-overlay" onClick={() => navigate("/")}>
                🔒 Sign in to choose a charity
              </div>
            )}
          </div>
        </div>

        {/* ---- WINNINGS ---- */}
        <Winnings winnings={data.winnings || []} />

        {/* ---- LEADERBOARD ---- */}
        <div className="db-card">
          <h3>🥇 Leaderboard</h3>
          {leaderboard.length > 0 ? (
            leaderboard.map((l, i) => (
              <div key={i} className="db-lb-row">
                <span>
                  {i === 0
                    ? "🥇"
                    : i === 1
                      ? "🥈"
                      : i === 2
                        ? "🥉"
                        : `#${i + 1}`}
                </span>
                <span className="db-lb-email">{l.email}</span>
                <span className="db-lb-score">🎯 {l.best_score}</span>
              </div>
            ))
          ) : (
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>
              No leaderboard data yet
            </p>
          )}
        </div>
        {/* FOOTER */}
        <div style={footer}>
          <div style={footerTop}>

            {/* LEFT */}
            <div>
              <h2 style={footerLogo}>
                ⛳ Golf Performance Hub
              </h2>

              <p style={footerText}>
                Track scores, compete in draws, support charities,
                and win exciting rewards while improving your game.
              </p>
            </div>

            {/* CENTER */}
            <div>
              <h3 style={footerHeading}>Quick Links</h3>

              <div style={footerLinks}>
                <span style={footerLink}>🏌️ Scores</span>
                <span style={footerLink}>🎲 Draw Results</span>
                <span style={footerLink}>💰 Winnings</span>
                <span style={footerLink}>❤️ Charity</span>
              </div>
            </div>

            {/* RIGHT */}
            <div>
              <h3 style={footerHeading}>Platform Status</h3>

              <div style={statusBox}>
                <span style={statusDot}></span>
                All systems operational
              </div>

              <p style={footerMini}>
                Live jackpot updates every 10 seconds 🚀
              </p>
            </div>

          </div>

          {/* BOTTOM */}
          <div style={footerBottom}>
            <p style={{ margin: 0 }}>
              © 2026 Golf Performance Hub • Built with ❤️ using React, Node.js & PostgreSQL
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;

//
//   STYLES
//

const theme = {
  bg: "#0b1120",
  card: "#111827",
  border: "#e2e8f0",
  text: "#e5e7eb",
  subText: "#64748b",
  primary: "#22c55e"
};

const container = {
  background: "#f8fafc",
  minHeight: "100vh",
  color: "#0f172a",
  overflowX: "hidden"
};

const content = {
  padding: "30px",
  width: "100%",
  maxWidth: "1600px",
  margin: "0 auto",
  boxSizing: "border-box"
};

const dashboardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px",
  marginBottom: "20px",
  alignItems: "start"
};

const title = {
  fontSize: "28px",
  fontWeight: "700",
  marginBottom: "20px"
};

const card = {
  background: "white",
  padding: "22px",
  borderRadius: "20px",
  marginBottom: "20px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
  transition: "all 0.25s ease",
  overflow: "hidden"
};

const cardHover = {
  ...card
};

const item = {
  padding: "12px 0",
  borderBottom: `1px solid ${theme.border}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  flexWrap: "wrap"
};

const subText = {
  color: theme.subText
};

const btn = {
  padding: "10px 16px",
  background: theme.primary,
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
  boxShadow: "0 4px 14px rgba(34,197,94,0.25)",
  transition: "0.2s"
};

const textPrimary = {
  color: "#0f172a",
  fontWeight: "600"
};

const textSecondary = {
  color: "#64748b"
};

const jackpotCard = {
  background: "linear-gradient(135deg, #020617, #1e293b)",
  padding: "24px",
  borderRadius: "20px",
  marginBottom: "20px",
  color: "white",
  boxShadow: "0 10px 35px rgba(15,23,42,0.25)",
  overflow: "hidden"
};

const jackpotAmount = {
  fontSize: "38px",
  fontWeight: "800",
  color: "#facc15",
  marginTop: "12px",
  marginBottom: "8px",
  letterSpacing: "1px"
};

const footer = {
  marginTop: "50px",
  background: "linear-gradient(135deg, #020617, #0f172a)",
  borderRadius: "24px",
  overflow: "hidden",
  color: "white",
  boxShadow: "0 10px 40px rgba(0,0,0,0.25)"
};

const footerTop = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "35px",
  padding: "35px 25px"
};

const footerLogo = {
  fontSize: "26px",
  fontWeight: "800",
  marginBottom: "12px",
  background: "linear-gradient(90deg, #22c55e, #38bdf8)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
};

const footerText = {
  color: "#cbd5e1",
  lineHeight: "1.8",
  fontSize: "14px"
};

const footerHeading = {
  marginBottom: "16px",
  fontSize: "16px",
  fontWeight: "700",
  color: "#f8fafc"
};

const footerLinks = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const footerLink = {
  color: "#cbd5e1",
  fontSize: "14px",
  cursor: "pointer",
  transition: "0.2s"
};

const statusBox = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "rgba(255,255,255,0.08)",
  padding: "12px 16px",
  borderRadius: "14px",
  width: "fit-content",
  fontSize: "14px",
  backdropFilter: "blur(10px)"
};

const statusDot = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: "#22c55e",
  boxShadow: "0 0 12px #22c55e"
};

const footerMini = {
  marginTop: "14px",
  color: "#94a3b8",
  fontSize: "13px",
  lineHeight: "1.6"
};

const footerBottom = {
  borderTop: "1px solid rgba(255,255,255,0.08)",
  padding: "20px",
  textAlign: "center",
  color: "#94a3b8",
  fontSize: "13px"
};
