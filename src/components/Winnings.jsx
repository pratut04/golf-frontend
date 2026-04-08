import React from "react";
import API from "../api/api"; // 🔥 ADD THIS AT TOP

function Winnings({ winnings }) {
  const totalEarnings = winnings?.reduce(
    (acc, w) => acc + Number(w.amount || 0),
    0
  );


  const uploadProof = async (file, winningId) => {
    const formData = new FormData();
    formData.append("proof", file);
    formData.append("winningId", winningId);

    try {
      await API.post("/upload-proof", formData);
      alert("✅ Proof uploaded");

      // OPTIONAL: reload page (quick fix)
      window.location.reload();

    } catch (err) {
      alert("❌ Upload failed");
    }
  };

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
            <b>₹{totalEarnings.toLocaleString()}</b>
          </div>

          {/* 🔥 IMPROVED HISTORY */}
          <div style={{ marginTop: "15px" }}>
            <h4>📜 History</h4>

            {winnings.map((w, i) => (
              <div key={i} style={historyCard}>

                {/* LEFT */}
                <div>
                  <p style={matchText}>
                    {w.match_type === "5 Match 🏆" && "🏆 Jackpot Winner"}
                    {w.match_type === "4 Match 🔥" && "🔥 4 Match Winner"}
                    {w.match_type === "3 Match 🎉" && "🎉 3 Match Winner"}
                  </p>

                  <p style={dateText}>
                    {new Date(w.created_at).toLocaleString("en-IN", {

                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </p>
                </div>

                {/* RIGHT */}
                <div style={{ textAlign: "right" }}>
                  <p style={amountText}>
                    ₹{Number(w.amount || 0)}
                  </p>

                  <p
                    style={{
                      ...statusText,
                      color:
                        w.status === "paid"
                          ? "#22c55e"
                          : "#facc15"
                    }}
                  >
                    {w.status === "paid" ? "✅ Paid" : "⏳ Pending"}
                  </p>
                  {w.status === "pending" && (
                    <input
                      type="file"
                      onChange={(e) => uploadProof(e.target.files[0], w.id)}
                    />
                  )}
                </div>

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

//
// 🎨 STYLES
//

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

const historyCard = {
  background: "#0f172a",
  padding: "12px",
  borderRadius: "10px",
  marginTop: "10px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  border: "1px solid #1e293b"
};

const matchText = {
  margin: 0,
  fontWeight: "bold",
  color: "white"
};

const dateText = {
  margin: 0,
  fontSize: "12px",
  color: "#94a3b8"
};

const amountText = {
  margin: 0,
  fontWeight: "bold",
  color: "#22c55e"
};

const statusText = {
  margin: 0,
  fontSize: "12px"
};