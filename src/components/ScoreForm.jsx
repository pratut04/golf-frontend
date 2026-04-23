import React, { useState, useEffect } from "react";
import API from "../api/api";
import { toast } from "react-toastify";

function ScoreForm({ addScore, subscriptionStatus, subscriptionEnd, refresh }) {
  const [score, setScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [nextMonthDate, setNextMonthDate] = useState("");
  const isExpired =
    subscriptionEnd && new Date(subscriptionEnd) < new Date();

  const isSubLocked =
    subscriptionStatus !== "active" || isExpired;




  // ================= DRAW LOCK =================
  const checkDraw = async () => {
    try {
      const res = await API.get("/latest-draw");

      //  CASE 1: NO DRAW EXISTS
      if (!res.data || !res.data.created_at) {
        setLocked(false);              // unlock
        setNextMonthDate("");          // optional reset
        return;
      }

      //  CASE 2: DRAW EXISTS
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
      toast.error(`Score entry closed. Next opens on ${nextMonthDate}`);
      return;
    }

    if (!score || isNaN(score)) {
      toast.error("Enter valid number");
      return;
    }

    const num = Number(score);

    if (num < 1 || num > 45) {
      toast.error("Score must be between 1 and 45", {
        toastId: "score-error"
      });
      return;
    }

    try {
      setLoading(true);
      await addScore(num);
      setScore("");

    } catch (err) {
      console.error("Score submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= NORMAL UI =================

  return (
    <div style={card}>
      <h3 style={{ color: "white" }}>🎯 Add Score</h3>


      {
        subscriptionStatus !== "active" ? (
          <p style={{ color: "red" }}>
            Please subscribe or renew to add scores
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
        style={{
          background: (locked || isSubLocked) ? "#94a3b8" : "#2563eb",
          color: "white",
          padding: "8px 16px",
          borderRadius: "8px",
          border: "none",
          cursor: (locked || isSubLocked) ? "not-allowed" : "pointer",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "all 0.2s ease",
          boxShadow: "none",
          opacity: (locked || isSubLocked) ? 0.7 : 1
        }}
        onClick={handleSubmit}
        onMouseEnter={(e) => {
          if (!(locked || isSubLocked)) {
            e.target.style.transform = "scale(1.05)";
          }
        }}
        onMouseLeave={(e) => {
          if (!(locked || isSubLocked)) {
            e.target.style.transform = "scale(1)";
          }
        }}
        disabled={loading || locked || isSubLocked}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Submitting...
          </>
        ) : (locked || isSubLocked) ? (
          "🔒 Locked"
        ) : (
          "Submit"
        )}
      </button>
      {isSubLocked && subscriptionEnd && (
        <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px" }}>
          Subscription Expired on {new Date(subscriptionEnd).toLocaleDateString("en-IN")}
        </p>
      )}

      {isSubLocked && !subscriptionEnd && (
        <p style={{ color: "#f59e0b", fontSize: "13px", marginTop: "6px" }}>
          Please subscribe to add score 💳
        </p>
      )}
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

