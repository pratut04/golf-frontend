import React, { useState, useEffect } from "react";
import API from "../api/api";

function ScoreForm({ addScore, subscriptionStatus, subscriptionEnd, refresh }) {
  const [score, setScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [nextMonthDate, setNextMonthDate] = useState("");

  // ================= DRAW LOCK =================
  // const checkDraw = async () => {
  //   try {
  //     const res = await API.get("/latest-draw");

  //     if (res.data.created_at) {
  //       const drawDate = new Date(res.data.created_at);
  //       const now = new Date();

  //       const sameMonth =
  //         drawDate.getMonth() === now.getMonth() &&
  //         drawDate.getFullYear() === now.getFullYear();

  //       setLocked(sameMonth);

  //       // ✅ ADD THIS
  //       const nextMonthStart = new Date(
  //         drawDate.getFullYear(),
  //         drawDate.getMonth() + 1,
  //         1
  //       );

  //       const formatted = nextMonthStart.toLocaleDateString("en-IN", {
  //         day: "numeric",
  //         month: "long",
  //         year: "numeric"
  //       });

  //       setNextMonthDate(formatted);
  //     }
  //   } catch (err) {
  //     console.error("Draw check error:", err);
  //   }
  // };
  const checkDraw = async () => {
    try {
      const res = await API.get("/latest-draw");

      // ❗ CASE 1: NO DRAW EXISTS
      if (!res.data || !res.data.created_at) {
        setLocked(false);              // ✅ unlock
        setNextMonthDate("");          // optional reset
        return;
      }

      // ❗ CASE 2: DRAW EXISTS
      const drawDate = new Date(res.data.created_at);
      const now = new Date();

      const sameMonth =
        drawDate.getMonth() === now.getMonth() &&
        drawDate.getFullYear() === now.getFullYear();

      setLocked(sameMonth);

      const nextMonthStart = new Date(
        drawDate.getFullYear(),
        drawDate.getMonth() + 1,
        1
      );

      const formatted = nextMonthStart.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });

      setNextMonthDate(formatted);

    } catch (err) {
      console.error("Draw check error:", err);
    }
  };

  useEffect(() => {
    checkDraw();
  }, []);

  useEffect(() => {
    checkDraw();
  }, [refresh]);


  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (loading) return;

    if (locked) {
      alert(`❌ Score entry closed. Next opens on ${nextMonthDate}`);
      return;
    }

    if (!score || isNaN(score)) {
      alert("Enter valid number");
      return;
    }

    const num = Number(score);

    if (num < 1 || num > 45) {
      alert("Score must be between 1 and 45");
      return;
    }

    try {
      setLoading(true);
      await addScore(num);
      setScore("");
    } catch (err) {
      console.error("Score submit error:", err);
      alert("❌ Failed to add score");
    } finally {
      setLoading(false);
    }
  };


  // ================= NORMAL UI =================

  return (
    <div style={card}>
      <h3 style={{ color: "white" }}>🎯 Add Score</h3>
      // ================= EARLY RETURN =================

      {
        subscriptionStatus !== "active" ? (
          <p style={{ color: "red" }}>
            ❌ Please subscribe or renew to add scores
          </p>
        ) : locked ? (
          <p style={{ color: "#ef4444", fontSize: "14px", lineHeight: "1.6" }}>
            🔒 Score entry closed for this month <br />
            📅 Next entry opens on{" "}
            <b style={{ color: "#22c55e" }}>
              {nextMonthDate || "next month"}
            </b>
          </p>
        ) : null
      }


      <input
        type="number"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Enter score (1-45)"
        style={input}
        disabled={locked}
      />

      <button
        onClick={handleSubmit}
        className="admin-btn"
        disabled={loading || locked}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}

export default ScoreForm;

// 🎨 STYLES

const card = {
  background: "#0f172a",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "15px",
  border: "1px solid #e2e8f0",
};

const input = {
  padding: "10px",
  marginRight: "10px",
  borderRadius: "6px",
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  color: "#0f172a",
};

