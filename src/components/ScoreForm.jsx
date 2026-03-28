import React, { useState } from "react";

function ScoreForm({ addScore }) {
  const [score, setScore] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false); // ✅ NEW

  const handleSubmit = async () => {
    if (loading) return; // ✅ prevent double click

    // ✅ validation
    if (!score || isNaN(score)) {
      alert("Enter valid number");
      return;
    }

    if (Number(score) < 1 || Number(score) > 45) {
      alert("Score must be between 1 and 45");
      return;
    }

    if (!date) {
      alert("Select date");
      return;
    }

    try {
      setLoading(true);

      // ✅ send string date
      await addScore(score.trim(), date);

      // ✅ reset
      setScore("");
      setDate("");

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={card}>
      <h3>🎯 Add Score</h3>

      <input
        type="number"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Enter score (1-45)"
        style={input}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={input}
      />

      <button onClick={handleSubmit} style={btn} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}

export default ScoreForm;

// 🎨 styles
const card = {
  background: "#1e1e1e",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "15px",
  color: "white"
};

const input = {
  padding: "8px",
  marginRight: "10px",
  borderRadius: "6px",
  border: "none"
};

const btn = {
  padding: "8px 12px",
  background: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};