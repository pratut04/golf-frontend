import React, { useEffect, useState } from "react";

export default function ResendOTP({ onResend }) {
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    setLoading(true);

    await onResend(); // call your API

    setTimer(30); // reset timer
    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      
      {/* TIMER TEXT */}
      {timer > 0 ? (
        <p style={{ color: "#aaa", fontSize: "14px" }}>
          Resend OTP in <b>{timer}s</b>
        </p>
      ) : (
        <p style={{ color: "#4CAF50", fontSize: "14px" }}>
          You can resend OTP now
        </p>
      )}

      {/* BUTTON */}
      <button
        onClick={handleResend}
        disabled={timer > 0 || loading}
        style={{
          padding: "12px 24px",
          borderRadius: "10px",
          border: "none",
          fontWeight: "600",
          fontSize: "14px",
          cursor: timer > 0 ? "not-allowed" : "pointer",
          background:
            timer > 0
              ? "#444"
              : "linear-gradient(135deg, #6a11cb, #2575fc)",
          color: "#fff",
          opacity: loading ? 0.7 : 1,
          transition: "all 0.3s ease",
          boxShadow:
            timer === 0
              ? "0 4px 15px rgba(37, 117, 252, 0.4)"
              : "none",
        }}
      >
        {loading ? "Sending..." : "Resend OTP"}
      </button>
    </div>
  );
}