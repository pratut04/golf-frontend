import React from "react";

function Winnings({ winnings }) {
  return (
    <div style={card}>
      <h3>🏆 Winnings</h3>

      {winnings?.length > 0 ? (
        <>
          <div style={box}>
             Total Wins: <b>{winnings.length}</b>
          </div>

          <div style={box}>
             Total Earnings:{" "}
            <b>
              ₹
              {winnings.reduce((acc, w) => acc + w.amount, 0)}
            </b>
          </div>

          <div style={{ marginTop: "10px" }}>
            <h4>History</h4>

            {winnings.map((w, i) => (
              <div key={i} style={item}>
                 {w.type} | ₹{w.amount} | {w.status}
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

// styles
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

const item = {
  padding: "6px 0",
  borderBottom: "1px solid #333"
};
