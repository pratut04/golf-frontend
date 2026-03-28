import React from "react";

function Winnings() {
  return (
    <div style={card}>
      <h3>🏆 Winnings</h3>

      <p style={{ opacity: 0.7 }}>
        Your rewards and prizes will appear here.
      </p>

      <div style={box}>
        🎁 Total Wins: <b>0</b>
      </div>

      <div style={box}>
        💰 Total Earnings: <b>₹0</b>
      </div>
    </div>
  );
}

export default Winnings;

// 🎨 styles
const card = {
  background: "#1e1e1e",
  padding: "15px",
  borderRadius: "8px",
  marginTop: "15px",
  color: "white"
};

const box = {
  background: "#111",
  padding: "10px",
  borderRadius: "6px",
  marginTop: "10px",
  border: "1px solid #333"
};
