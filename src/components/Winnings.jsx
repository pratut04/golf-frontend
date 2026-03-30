import React from "react";

function Winnings({ winnings }) {
  const totalEarnings = winnings?.reduce(
    (acc, w) => acc + Number(w.amount || 0), // ✅ safe
    0
  );

  return (
    <div style={card}>
      <h3>🏆 Winnings</h3>

      {winnings?.length > 0 ? (
        <>
          <div style={box}>
            🎯 Total Wins: <b>{winnings.length}</b>
          </div>

          <div style={box}>
            💰 Total Earnings:{" "}
            <b>₹{totalEarnings.toLocaleString()}</b> {/* ✅ formatted */}
          </div>

          <div style={{ marginTop: "10px" }}>
            <h4>📜 History</h4>

            {winnings.map((w, i) => (
              <div key={i} style={item}>
                {w.match_type} | ₹{Number(w.amount || 0)} | {w.status}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p style={{ opacity: 0.7 }}>
          No winnings yet 😢
        </p>
      )}
    </div>
  );
}

export default Winnings;

// 🎨 styles
const card = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "8px",
  marginTop: "15px",
  color: "white"
};

const box = {
  background: "#334155",
  padding: "12px",
  borderRadius: "8px",
  marginTop: "12px",
  border: "1px solid #333"
};

const item = {
  padding: "6px 0",
  borderBottom: "1px solid #333"
};