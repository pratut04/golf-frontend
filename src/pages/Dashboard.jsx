import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

import ScoreForm from "../components/ScoreForm";
import CharityList from "../components/CharityList";
import Winnings from "../components/Winnings";
import { toast } from "react-toastify";

function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null); // ✅ FIX
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

      // ✅ GUEST MODE
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

    // 🔥 first load
    checkAndLoad();

    // 🔥 AUTO REFRESH
    const interval = setInterval(() => {
      const isGuest =
        localStorage.getItem("guest") === "true" &&
        !localStorage.getItem("token");

      if (isGuest) {
        loadData();   // ✅ allow guest refresh
      } else {
        const userId = localStorage.getItem("userId");
        if (userId) {
          loadData();
          setRefresh(prev => !prev);
        }
      }
    }, 15000);

    // 🔥 cleanup
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
    fetchJackpot(); // first load

    const interval = setInterval(fetchJackpot, 10000); // every 10 sec

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const isGuest =
      localStorage.getItem("guest") === "true" &&
      !localStorage.getItem("token");

    // ✅ STOP API CALLS FOR GUEST
    if (isGuest) {
      setSubscriptionStatus("inactive");

      try {
        const [c, l] = await Promise.all([
          API.get("/charities"),
          API.get("/leaderboard")
        ]);

        setCharities(c.data.data);
        setLeaderboard(l.data.data || []);

      } catch (err) {
        showToast("error", "Failed to load data");
      }

      // ✅ Fake user
      setData({
        user: {
          email: "Guest User",
          charity_name: null
        },
        scores: [],
        winnings: []
      });

      return;
    }

    // ✅ NORMAL USER FLOW
    try {
      const d = await API.get("/dashboard");

      // ✅ get all scores from backend
      const allScores = d.data.scores || [];

      // ✅ sort latest first (important safety)
      const sortedScores = allScores.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      // ✅ take only latest 5
      const latestFiveScores = sortedScores.slice(0, 5);

      // ✅ set data with limited scores
      setData({
        ...d.data,
        scores: latestFiveScores
      });
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

  // ✅ FIXED LOADING CONDITION
  if (!data) {
    return (
      <p style={{ color: "white", textAlign: "center" }}>
        Loading...
      </p>
    );
  }

  // ✅ ERROR CASE
  if (data.success === false) {
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

  const isGuest =
    localStorage.getItem("guest") === "true" &&
    !localStorage.getItem("token");

  //=================addScore Function===============
  // const addScore = async (score) => {
  //   setSubMsg("");
  //   try {
  //     const isGuest =
  //       localStorage.getItem("guest") === "true" &&
  //       !localStorage.getItem("token");
  //     if (isGuest) {
  //       setSubMsg("Login required to add score ⚠️");
  //       return;
  //     }



  //     const subRes = await API.post("/check-subscription");

  //     const status = subRes.data.status;
  //     const end = subRes.data.subscription_end;

  //     // ❌ NOT SUBSCRIBED
  //     if (status === "not_subscribed") {
  //       setSubMsg("⚠️ Please subscribe to use this feature");



  //       return;
  //     }

  //     // ❌ EXPIRED
  //     if (status === "expired") {
  //       setSubMsg(` Subscription expired on ${new Date(end).toLocaleDateString("en-IN", {
  //         day: "2-digit",
  //         month: "short",
  //         year: "numeric"
  //       })}`);



  //       return;
  //     }

  //     await API.post("/scores", {

  //       score: Number(score),
  //     });

  //     setSubMsg("✅ Score added");
  //     loadData();

  //   } catch (err) {
  //     console.error("FULL ERROR:", err);

  //     if (err.response && err.response.data && err.response.data.error) {
  //       setSubMsg(err.response.data.error);   // ✅ THIS LINE FIXES EVERYTHING
  //     } else {
  //       setSubMsg("Error adding score ❌");
  //     }
  //   }
  // };
  const addScore = async (score) => {
    try {
      const isGuest =
        localStorage.getItem("guest") === "true" &&
        !localStorage.getItem("token");

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
  //================selectCharitiey function==================
  // const selectCharity = async (id) => {
  //   try {
  //     const isGuest =
  //       localStorage.getItem("guest") === "true" &&
  //       !localStorage.getItem("token");

  //     if (isGuest) {
  //       showToast("warning", "Login required to select charity");
  //       return;
  //     }

  //     // ✅ Update UI instantly
  //     setSelectedId(Number(id));

  //     await API.post("/select-charity", {
  //       charity_id: id
  //     });

  //     showToast("success", "Charity selected ❤️");

  //     const selected = charities.find(c => Number(c.id) === Number(id));

  //     setData(prev => ({
  //       ...prev,
  //       user: {
  //         ...prev.user,
  //         charity_id: Number(id),
  //         charity_name: selected?.name || prev.user.charity_name
  //       }
  //     }));

  //   } catch (err) {
  //     const errData = err.response?.data;

  //     if (err.response?.status === 403) {
  //       if (errData?.code === "NOT_SUBSCRIBED") {
  //         showToast("warning", "Please subscribe first 💳");
  //       } else if (errData?.code === "SUBSCRIPTION_EXPIRED") {
  //         showToast(
  //           "error",
  //           `Expired on ${new Date(errData.expiry).toLocaleDateString("en-IN")}`
  //         );
  //       } else {
  //         showToast("error", "Access denied");
  //       }
  //     } else {
  //       showToast("error", errData?.message || "Something went wrong");
  //     }
  //   }
  // };

  // const selectCharity = async (id) => {
  //   try {
  //     await API.post("/select-charity", {
  //       charity_id: id // ✅ string 그대로
  //     });

  //     const selected = charities.find(c => c.id === id);

  //     setData(prev => ({
  //       ...prev,
  //       user: {
  //         ...prev.user,
  //         charity_id: id,
  //         charity_name: selected?.name
  //       }
  //     }));

  //     showToast("success", "Charity selected ❤️");

  //   } catch (err) {
  //     const errData = err.response?.data;

  //     if (errData?.code === "ALREADY_SELECTED") {
  //       setData(prev => ({
  //         ...prev,
  //         user: {
  //           ...prev.user,
  //           charity_id: id
  //         }
  //       }));
  //     }

  //     showToast("error", errData?.message || "Something went wrong");
  //   }
  // };


  const selectCharity = async (id) => {
  try {
    const isGuest =
      localStorage.getItem("guest") === "true" &&
      !localStorage.getItem("token");

    // 🔒 GUEST MODE
    if (isGuest) {
      showToast("warning", "Login required to select charity");
      return;
    }

    // ✅ Optimistic UI update (instant selection)
    setSelectedId(id);

    await API.post("/select-charity", {
      charity_id: id   // ✅ KEEP STRING (UUID)
    });

    showToast("success", "Charity selected ❤️");

    const selected = charities.find(c => c.id === id);

    setData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        charity_id: id,
        charity_name: selected?.name || prev.user.charity_name
      }
    }));

  } catch (err) {
    const errData = err.response?.data;

    // 🔁 rollback UI if API fails
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
      // ✅ Handle already selected properly
      setSelectedId(id);
      showToast("info", "Already selected ✅");

    } else {
      showToast("error", errData?.message || "Something went wrong");
    }
  }
};

  //================check result===================
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

      // ✅ CALL API
      const res = await API.post("/check-result");

      console.log("RESULT:", res.data);

      setResult(res.data); // ✅ FIX ADDED HERE

      showToast("success", "Result loaded 🎯");

    } catch (err) {
      showToast("error", err.response?.data?.message || "Something went wrong");

      setResult(null);
    }
  };

  return (
    <div style={container}>
      <Navbar />

      <div style={content}>
        <div
          style={{
            marginBottom: "30px",
            padding: "22px 24px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, #020617, #0f172a)",
            color: "white",
            //boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.01)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {/* LEFT SIDE */}
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "800",
                background: "linear-gradient(90deg, #22c55e, #38bdf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 2px 12px rgba(34,197,94,0.25)",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}
            >
              Golf Performance Hub
            </h1>

            {/* ✅ UPDATED TAGLINE (INSIDE, NOT OUTSIDE) */}
            <p
              style={{
                fontSize: "14px",
                color: "#e2e8f0",
                opacity: 0.9
              }}
            >
              Play smarter. Track better. Win bigger.
            </p>
          </div>

          {/* RIGHT SIDE BADGE */}
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              padding: "8px 14px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: "500",
              backdropFilter: "blur(10px)"
            }}
          >
            🚀 Live Dashboard
          </div>
        </div>

        {isGuest && (
          <div style={{
            background: "rgba(251, 191, 36, 0.15)",
            border: "1px solid rgba(251, 191, 36, 0.3)",
            color: "#92400e",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "15px",
            textAlign: "center"
          }}>
            <p style={{ marginBottom: "8px" }}>
              🔒 You are in Guest Mode — limited access
            </p>

            <button
              onClick={() => navigate("/")}
              style={{
                padding: "8px 16px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Login to Unlock Features
            </button>
          </div>
        )}

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

          {/* ✅ ALWAYS SHOW EMAIL */}
          <p style={textSecondary}>
            Email: <span style={textPrimary}>{data.user.email}</span>
          </p>

          {subscriptionStatus !== "active" ? (
            <>
              <p style={textSecondary}>
                Status: <span style={{ color: "#ef4444" }}>Not Subscribed</span>
              </p>

              {/* ✅ SHOW EXPIRED DATE */}
              {data.user.subscription_end && (
                <p style={textSecondary}>
                  Last expiry:{" "}
                  <span style={textPrimary}>
                    {new Date(data.user.subscription_end).toLocaleDateString()}
                  </span>
                </p>
              )}

              <button
                style={btn}
                onClick={() => {
                  const isGuest = localStorage.getItem("guest") === "true";

                  if (isGuest) {
                    showToast("warning", "Please sign in to continue");


                    setTimeout(() => {
                      navigate("/");
                    }, 200);
                  } else {
                    navigate("/subscription");
                  }
                }}
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
              </div>
            </>
          )}
        </div>
        {/* Score */}
        <div style={cardHover}>
          <h3>🏌️ Enter Score</h3>
          <div style={{ position: "relative" }}>
            {/* Actual content */}
            <div style={{
              opacity: isGuest ? 0.6 : 1,
              filter: isGuest ? "blur(1.5px)" : "none"
            }}>
              <ScoreForm
                addScore={addScore}
                subscriptionStatus={subscriptionStatus}
                subscriptionEnd={data.user.subscription_end}
                refresh={refresh}
              />
            </div>

            {/* Overlay for guest */}
            {isGuest && (
              <div
                onClick={() => navigate("/")}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(3px)",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                🔒 Sign in to record your score
              </div>
            )}
          </div>

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

          <div style={{ position: "relative" }}>
            {/* Actual Charity List */}
            <div style={{
              opacity: isGuest ? 0.6 : 1,
              filter: isGuest ? "blur(1.5px)" : "none"
            }}>
              <CharityList
                charities={charities}
                selectCharity={selectCharity}
                selectedId={data.user?.charity_id}
              />
            </div>

            {/* Overlay */}
            {isGuest && (
              <div
                onClick={() => navigate("/")}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(3px)",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                🔒 Sign in to choose a charity
              </div>
            )}
          </div>
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
        <div style={jackpotCard}>
          <h3>💰 Jackpot</h3>

          <div style={jackpotAmount}>
            ₹{Number(jackpot).toLocaleString()}
          </div>

          <p style={{ opacity: 0.7 }}>
            5 match prize = jackpot + 40% of pool
          </p>
          <p style={{ marginTop: "5px", fontSize: "14px" }}>
            🏆 Estimated Next Jackpot: ₹{Math.floor(Number(jackpot) + (Number(basePool) * 0.4))}
          </p>
        </div>

        {/* Draw & Result */}
        <div style={cardHover}>
          <h3>🎲 Draw & Result</h3>

          {/* MESSAGE */}


          <div style={{ position: "relative" }}>
            {/* ACTUAL CONTENT */}
            <div
              style={{
                opacity: isGuest ? 0.6 : 1,
                filter: isGuest ? "blur(1.5px)" : "none"
              }}
            >
              <button
                style={{
                  background: "#2563eb",
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
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              >
                Check Result
              </button>

              {/* RESULT */}
              {result && subscriptionStatus === "active" && (
                <div style={{ marginTop: "10px" }}>
                  <p>Result: {result.result}</p>
                  <p>Numbers: {result.numbers?.join(", ")}</p>

                  <p>
                    Draw Date:{" "}
                    {new Date(result.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* 🔒 OVERLAY */}
            {isGuest && (
              <div
                onClick={() => navigate("/")}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.6)",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                🔒 Sign in to continue
              </div>
            )}
          </div>
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

const jackpotCard = {
  background: "linear-gradient(135deg, #1e293b, #0f172a)",
  padding: "20px",
  borderRadius: "10px",
  marginTop: "15px",
  color: "white",
  boxShadow: "0 0 20px rgba(255,215,0,0.2)"
};

const jackpotAmount = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#facc15",
  marginTop: "10px"
};
