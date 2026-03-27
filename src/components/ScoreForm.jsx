import { useState } from "react";

function ScoreForm({ addScore }) {
  const [score, setScore] = useState("");

  return (
    <div className="card">
      <h3>Add Score</h3>

      <input
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Enter score"
      />

      <button onClick={() => addScore(score)}>
        Submit
      </button>
    </div>
  );
}

export default ScoreForm;