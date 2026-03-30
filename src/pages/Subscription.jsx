import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
// ✅ Uncomment if you want navbar
// import Navbar from "../components/Navbar";

function Subscription() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 🔐 Protect page
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      navigate("/");
    }
  }, [navigate]);

  // 💳 PAYMENT FUNCTION
  const handlePayment = async (type) => {
    if (loading) return;

    try {
      setLoading(true);

      const amount = type === "yearly" ? 1000 : 100;

      // ✅ Check Razorpay loaded
      if (typeof window === "undefined" || !window.Razorpay) {
        alert("Razorpay not loaded ❌");
        return;
      }

      const options = {
        key: "rzp_test_SXQLt37SiX7Arq", // 🔥 your test key
        amount: amount * 100, // paise
        currency: "INR",
        name: "Golf App",
        description: `${type} subscription`,

        handler: async function (response) {
          try {
            await API.post("/verify-payment", {
              razorpay_payment_id: response.razorpay_payment_id,
              user_id: localStorage.getItem("userId"),
              type: type
            });

            alert("✅ Payment successful");
            navigate("/dashboard");

          } catch (err) {
            console.error("VERIFY ERROR:", err);
            alert("❌ Verification failed");
          }
        },

        theme: {
          color: "#22c55e"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("PAYMENT ERROR:", err);
      alert("❌ Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      {/* ✅ Add Navbar only if imported */}
      {/* <Navbar /> */}

      <h1>💳 Choose Subscription</h1>

      <div style={card}>
        <h2>Monthly Plan</h2>
        <button
          onClick={() => handlePayment("monthly")}
          style={btn}
          disabled={loading}
        >
          {loading ? "Processing..." : "Subscribe Monthly"}
        </button>
      </div>

      <div style={card}>
        <h2>Yearly Plan</h2>
        <button
          onClick={() => handlePayment("yearly")}
          style={btn}
          disabled={loading}
        >
          {loading ? "Processing..." : "Subscribe Yearly"}
        </button>
      </div>
    </div>
  );
}

export default Subscription;

// 🎨 styles
const container = {
  textAlign: "center",
  padding: "40px",
  color: "white",
  background: "#0f172a",
  minHeight: "100vh"
};

const card = {
  background: "#1e293b",
  padding: "20px",
  margin: "20px auto",
  borderRadius: "10px",
  width: "300px"
};

const btn = {
  padding: "10px",
  background: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};