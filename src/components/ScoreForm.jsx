import React, { useState } from "react";

function ScoreForm({ addScore }) {
  const [score, setScore] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;

    // ✅ validation
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

      // ✅ reset
      setScore("");
  

    } catch (err) {
      console.error("Score submit error:", err);
      alert("❌ Failed to add score");
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

      

      <button onClick={handleSubmit} style={btn} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}

export default ScoreForm;

// 🎨 LIGHT THEME STYLES

const card = {
  background: "#0f172a",              // ✅ light background
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "15px",
  border: "1px solid #e2e8f0",
  color: "#0f172a",                  // ✅ dark text
};

const input = {
  padding: "10px",
  marginRight: "10px",
  borderRadius: "6px",
  border: "1px solid #e2e8f0",
  background: "#ffffff",             // ✅ white input
  color: "#0f172a",
  outline: "none"
};

const btn = {
  padding: "10px 14px",
  background: "#2563eb",             // ✅ professional blue
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  boxShadow: "0 4px 10px rgba(37,99,235,0.25)"
};
