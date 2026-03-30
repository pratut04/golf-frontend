import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

import ScoreForm from "../components/ScoreForm";
import CharityList from "../components/CharityList";
import Winnings from "../components/Winnings";

function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null); // ✅ FIX
  const [charities, setCharities] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [result, setResult] = useState(null);



  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    // ✅ Auth check
    if (!token || !userId) {
      navigate("/");
      return;
    }

    // ✅ Subscription check
    API.post("/check-subscription", {
      user_id: userId
    });

    // ✅ Load dashboard data
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

      alert("❌ Failed to load dashboard (check backend)");
    }
  };

  // ✅ FIXED LOADING CONDITION
  if (!data) {
    return (
      <p style={{ color: "white", textAlign: "center" }}>
        Loading...
      </p>
    );
  }

  // ✅ ERROR CASE
  if (data.error) {
    return (
      <p style={{ color: "red", textAlign: "center" }}>
        Failed to load dashboard ❌ (check backend)
      </p>
    );
  }

  // ✅ SAFETY CHECK
  if (!data.user) {
    return (
      <p style={{ color: "white", textAlign: "center" }}>
        No user data found ❌
      </p>
    );
  }

  //=================addScore Function===============
  const addScore = async (score, date) => {
    // 🔒 BLOCK IF INACTIVE
    if (data?.user?.subscription_status !== "active") {
      alert("Please subscribe to continue");
      return;
    }
    try {
      const userId = localStorage.getItem("userId");

      await API.post("/scores", {
        user_id: userId,
        score: Number(score),
      });

      alert("✅ Score added");
      loadData(userId);
    } catch (err) {
      console.error(err);
      alert("❌ Error adding score");
    }
  };
  //================selectCharitiey function==================
  const selectCharity = async (id) => {

    // 🔒 BLOCK IF INACTIVE
    if (data?.user?.subscription_status !== "active") {
      alert("Please subscribe to continue");
      return;
    }
    try {
      const userId = localStorage.getItem("userId");

      await API.post("/select-charity", {
        user_id: userId,
        charity_id: id
      });

      alert("Charity selected ✅");
      await loadData(userId);
    } catch (err) {
      console.error("CHARITY ERROR:", err);
    }
  };

  const checkResult = async () => {
    // 🔒 BLOCK IF INACTIVE
    if (data?.user?.subscription_status !== "active") {
      alert("Please subscribe to continue");
      return;
    }
    try {
      const userId = localStorage.getItem("userId");

      const res = await API.post("/check-result", {
        user_id: userId
      });

      setResult(res.data);

      await loadData(userId);
    } catch (err) {
      console.error("DRAW ERROR:", err);
    }
  };

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
        <h1 style={title}>🎯 User Dashboard</h1>


        {/* Subscription */}
        <div
          style={card}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>📌 Subscription</h3>

          {data.user.subscription_status !== "active" ? (
            <>
              <p style={textSecondary}>
                Status: <span style={{ color: "#ef4444" }}>Not Subscribed</span>
              </p>

              <button
                style={btn}
                onClick={() => navigate("/subscription")}
              >
                💳 Subscribe Now
              </button>
            </>
          ) : (
            <>
              <div style={{ lineHeight: "1.8" }}>
                <p style={textSecondary}>
                  Status:{" "}
                  <span style={{ ...textPrimary, color: "#22c55e" }}>
                    Active
                  </span>
                </p>

                <p style={textSecondary}>
                  Plan:{" "}
                  <span style={textPrimary}>
                    {data.user.subscription_type === "yearly"
                      ? "Yearly Plan 🏆"
                      : "Monthly Plan 📅"}
                  </span>
                </p>

                <p style={textSecondary}>
                  Expiry:{" "}
                  <span style={textPrimary}>
                    {new Date(data.user.subscription_end).toLocaleDateString()}
                  </span>
                </p>

                <p style={textSecondary}>
                  Email: <span style={textPrimary}>{data.user.email}</span>
                </p>
              </div>
            </>
          )}
        </div>
        {/* Score */}
        <div style={cardHover}>
          <h3>🏌️ Enter Score</h3>
          <ScoreForm addScore={addScore} />
        </div>

        {/* Scores */}
        <div style={cardHover}>
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

        {/* Charity */}
        <div style={cardHover}>
          <h3>❤️ Charity Selection</h3>
          <p style={{ color: "#334155" }}>
            Selected:{" "}
            <span style={{ color: "#16a34a", fontWeight: "600" }}>
              {data.user.charity_name || "Not selected"}
            </span>
          </p>

          <CharityList
            charities={charities}
            selectCharity={selectCharity}
            selectedId={data.user.charity_id}
          />
        </div>

        {/* Participation */}
        <div style={cardHover}>
          <h3>📊 Participation</h3>
          <p style={{ color: "#334155", fontWeight: "500" }}>
            Total Scores Entered:
            <span style={{ color: "#0f172a", fontWeight: "600" }}>
              {" "} {data.scores?.length || 0}
            </span>
          </p>
        </div>

        {/* Result */}
        <div style={cardHover}>
          <h3>🎲 Draw & Result</h3>

          <button
            style={{
              background: "#2563eb",   // ✅ blue
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 10px rgba(37, 99, 235, 0.4)"
            }}
            onClick={checkResult}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >
            Check Result
          </button>

          {result && (
            <div style={{ marginTop: "10px" }}>
              <p>Result: {result.result}</p>
              <p>Numbers: {result.numbers?.join(", ")}</p>
            </div>
          )}
        </div>

        <Winnings winnings={data.winnings || []} />

        {/* Leaderboard */}
        <div style={cardHover}>
          <h3>🥇 Leaderboard</h3>

          {leaderboard.length > 0 ? (
            leaderboard.map((l, i) => (
              <div key={i} style={item}>
                <span>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>

                <span style={{ flex: 1, marginLeft: "10px" }}>
                  {l.email}
                </span>

                <span style={{ fontWeight: "600" }}>
                  🎯 {l.best_score}
                </span>
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

//
// 🎨 PREMIUM STYLES
//

const theme = {
  bg: "#0b1120",
  card: "#111827",
  border: "#1f2937",
  text: "#e5e7eb",
  subText: "#9ca3af",
  primary: "#22c55e"
};

const container = {
  background: "#f8fafc",
  minHeight: "100vh",
  color: "#0f172a"
};

const content = {
  padding: "30px 20px",
  maxWidth: "900px",
  margin: "auto"
};

const title = {
  fontSize: "28px",
  fontWeight: "700",
  marginBottom: "20px"
};

const card = {
  background: "white", // ✅ no blue
  backdropFilter: "blur(12px)",
  padding: "20px",
  borderRadius: "16px",
  marginBottom: "20px",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
};

const cardHover = {
  ...card
};

const item = {
  padding: "10px 0",
  borderBottom: `1px solid ${theme.border}`
};

const subText = {
  color: theme.subText
};

const btn = {
  padding: "10px 16px",
  background: theme.primary,
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  boxShadow: "0 4px 14px rgba(34,197,94,0.4)",
  transition: "0.2s"
};

const textPrimary = {
  color: "#0f172a",
  fontWeight: "600"
};

const textSecondary = {
  color: "#64748b"
};