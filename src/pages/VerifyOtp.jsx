import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || localStorage.getItem("otpEmail");

    if (!email) {
        return <h2 style={{ color: "white" }}>Email missing!</h2>;
    }

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputs = useRef([]);

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // ⏳ countdown
    useEffect(() => {
        if (timer === 0) return;
        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // 🔢 handle input
    const handleChange = (value, index) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleBackspace = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    // ✅ verify OTP
    const handleVerify = async () => {
        setLoading(true);
        setError("");
        setMessage("");
        
        const finalOtp = otp.join("");

        try {
            const res = await fetch("https://golf-backend.onrender.com/verify-otp", {   //"https://golf-backend.onrender.com/verify-otp"   "http://localhost:5000/verify-otp"
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, otp: finalOtp })
            });

            const data = await res.json();

            if (res.ok) {
                alert("Verified ✅");
                navigate("/login");
            } else {
                setError(data.error || "Invalid OTP");
            }
        } catch {
            setError("Server error");
        }

        setLoading(false);
    };

    // 🔁 resend OTP
    const handleResend = async () => {
        if (resendLoading) return; // prevent multiple clicks

        setResendLoading(true);
        setError(""); // clear old error

        try {
            await fetch("https://golf-backend.onrender.com/resend-otp", {   //"https://golf-backend.onrender.com/resend-otp"  "http://localhost:5000/resend-otp"
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            setTimer(30);
            setMessage("New OTP sent");
            setError("");

        } catch {
            setError("Failed to resend");
            setMessage("");
        }

        setResendLoading(false);
    };

    if (!email) {
        return (
            <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
                Email missing! Please signup again.
            </div>
        );
    }
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>Verify OTP</h2>
                <p style={{ color: "#aaa" }}>Sent to {email}</p>

                <div style={styles.otpBox}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputs.current[index] = el)}
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleBackspace(e, index)}
                            maxLength={1}
                            style={styles.input}
                        />
                    ))}
                </div>

                {message && (
                    <p style={{ color: "#22c55e", marginBottom: "12px" }}>
                        {message}
                    </p>
                )}

                {error && (
                    <p style={{ color: "red", marginBottom: "12px" }}>
                        {error}
                    </p>
                )}

               

                <button onClick={handleVerify} style={styles.button} disabled={loading}>
                    {loading ? "Verifying..." : "Verify"}
                </button>

                <div style={{ marginTop: 20 }}>

                    {/* TIMER TEXT */}
                    {timer > 0 && (
                        <p style={{
                            color: "#94a3b8",
                            fontSize: "13px",
                            marginBottom: "10px"
                        }}>
                            Resend OTP in <b>{timer}s</b>
                        </p>
                    )}

                    {/* BUTTON */}
                    <button
                        onClick={handleResend}
                        disabled={timer > 0 || resendLoading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "10px",
                            border: "none",
                            fontWeight: "600",
                            fontSize: "14px",
                            letterSpacing: "0.5px",
                            cursor: timer > 0 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            background: timer > 0
                                ? "#334155"
                                : "linear-gradient(135deg, #6366f1, #3b82f6)",

                            color: "#fff",
                            opacity: timer > 0 ? 0.6 : 1,

                            transition: "all 0.3s ease",
                            boxShadow: timer === 0
                                ? "0 6px 20px rgba(59,130,246,0.4)"
                                : "none"
                        }}

                        onMouseEnter={(e) => {
                            if (timer === 0) e.target.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = "scale(1)";
                        }}
                    >
                        {resendLoading && (
                            <span className="spinner"></span>
                        )}
                        {resendLoading
                            ? "Sending..."
                            : timer > 0
                                ? `Wait ${timer}s`
                                : "Resend OTP"}
                    </button>
                </div>
            </div>
        </div>
    );
}
const styles = {
    container: {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a"
    },
    card: {
        background: "#1e293b",
        padding: "30px",
        borderRadius: "12px",
        textAlign: "center",
        width: "320px",
        boxShadow: "0 0 20px rgba(0,0,0,0.3)"
    },
    otpBox: {
        display: "flex",
        justifyContent: "space-between",
        margin: "20px 0"
    },
    input: {
        width: "40px",
        height: "50px",
        fontSize: "20px",
        textAlign: "center",
        borderRadius: "8px",
        border: "1px solid #444",
        background: "#0f172a",
        color: "white"
    },
    button: {
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
        border: "none",
        background: "linear-gradient(to right, #22c55e, #3b82f6)",
        color: "white",
        cursor: "pointer"
    },
    resend: {
        background: "none",
        border: "none",
        color: "#3b82f6",
        cursor: "pointer"
    },
    error: {
        color: "red",
        fontSize: "14px"
    }



};



