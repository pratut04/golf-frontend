
import React from "react";
import { useOutletContext } from "react-router-dom";

function AdminWinnings() {
    const { winnings, approveWinning, rejectWinning } = useOutletContext();
    const [preview, setPreview] = React.useState(null);
    //const BASE_URL = "https://golf-backend-new.onrender.com";

    return (
        <div style={card}>
            <h3>💰 Winnings</h3>

            {winnings?.length > 0 ? (
                winnings.map((w) => (
                    <div key={w.id} style={row}>
                        {/* LEFT */}
                        <div>
                            <div>{w.email}</div>

                            <small style={{ color: "#9ca3af" }}>
                                {w.match_type}
                            </small>

                            <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                📅 {new Date(w.draw_date).toLocaleDateString("en-IN")}
                            </div>

                            <div style={{ fontWeight: "600" }}>
                                ₹{Number(w.amount).toLocaleString()}
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div>
                            <span
                                style={{
                                    color:
                                        w.status === "paid"
                                            ? "#3dc03b"
                                            : w.status === "rejected"
                                                ? "#ef4444"
                                                : "#facc15",
                                    marginRight: "10px",
                                }}
                            >
                                {w.status === "paid" && "✅ Paid"}
                                {w.status === "pending" && "⏳ Pending"}
                                {w.status === "rejected" && "❌ Rejected"}
                            </span>

                            {/* PROOF IMAGE */}
                            {w.proof && (
                                <img
                                    src={w.proof} 
                                    width="80"
                                    alt="proof"
                                    style={img}
                                    onClick={() => setPreview(w.proof)}  
                                />
                            )}


                            {/* ACTIONS */}
                            {w.status === "pending" && (
                                <>
                                    <button style={btn} onClick={() => approveWinning(w.id)}>
                                        Approve
                                    </button>

                                    <button
                                        className="reject-btn"
                                        style={{ ...btn, background: "#ef4444", marginLeft: "8px" }}
                                        onClick={() => rejectWinning(w.id)}
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p style={{ opacity: 0.6 }}>No winnings found 😢</p>
            )}

            {/*  PREVIEW MODAL */}
            {preview && (
                <div style={overlay} onClick={() => setPreview(null)}>
                    <img
                        src={preview}
                        alt="preview"
                        style={previewImg}
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}
        </div>
    );
}

export default AdminWinnings;

//  STYLES
const card = {
    background: "#ffffff",
    padding: "22px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
};

const row = {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #e2e8f0",
};

const btn = {
    padding: "8px 14px",
    background: "#4f46e5",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
};

const img = {
    marginTop: "6px",
    borderRadius: "6px",
    cursor: "pointer",
};

const overlay = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
};

const previewImg = {
    maxWidth: "90%",
    maxHeight: "90%",
    borderRadius: "12px",
};