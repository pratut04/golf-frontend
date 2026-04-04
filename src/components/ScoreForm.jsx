import React, { useState, useEffect } from "react";
import API from "../api/api";

function ScoreForm({ addScore, subscriptionStatus, subscriptionEnd }) {
  const [score, setScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  // ================= DRAW LOCK =================
  useEffect(() => {
    const checkDraw = async () => {
      try {
        const res = await API.get("/latest-draw");

        if (res.data.created_at) {
          const drawDate = new Date(res.data.created_at);
          const now = new Date();

          const sameMonth =
            drawDate.getMonth() === now.getMonth() &&
            drawDate.getFullYear() === now.getFullYear();

          setLocked(sameMonth);
        }
      } catch (err) {
        console.error("Draw check error:", err);
      }
    };

    checkDraw();
  }, []);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (loading) return;

    if (locked) {
      alert("❌ Scores locked for this month");
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
          <p style={{ color: "red" }}>
            🔒 Scores locked for this month
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
        style={btn}
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

const btn = {
  padding: "10px 14px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};