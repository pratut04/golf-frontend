import { useState } from "react";

function ScoreForm({ addScore }) {
  const [score, setScore] = useState("");

  const handleSubmit = () => {
    if (!score || isNaN(score)) {
      alert("Enter valid number");
      return;
    }

    addScore(score);
    setScore(""); // ✅ clear input
  };

  return (
    <div style={card}>
      <h3>🎯 Add Score</h3>

      <input
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Enter score"
        style={input}
      />

      <button onClick={handleSubmit} style={btn}>
        Submit
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
