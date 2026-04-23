

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Subscription() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [subscriptionType, setSubscriptionType] = useState(null);

  // 🔐 Protect + get subscription
  useEffect(() => {
    const checkSub = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        navigate("/");
        return;
      }

      try {
        const res = await API.post("/check-subscription", {
          user_id: userId
        });

        setSubscriptionStatus(res.data.status);
        setSubscriptionType(res.data.subscription_type);

      } catch (err) {
        console.error("SUB CHECK ERROR:", err);
      }
    };

    checkSub();
  }, [navigate]);

  // 💳 PAYMENT FUNCTION
  const handlePayment = async (type) => {
    if (loading) return;

    try {
      setLoading(true);

      const amount = type === "yearly" ? 1000 : 100;

      // ✅ STEP 1: CREATE ORDER FROM BACKEND
      const orderRes = await API.post("/create-order", { amount });

      const order = orderRes.data.data;

      if (!window.Razorpay) {
        toast.error("Razorpay not loaded ❌");
        return;
      }

      const options = {
        key:  "rzp_test_SXQLt37SiX7Arq", 
        amount: order.amount,
        currency: order.currency,
        order_id: order.id, // 🔥 IMPORTANT

        name: "Golf App",
        description: `${type} subscription`,

        handler: async function (response) {
          try {
            await API.post("/verify-payment", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              type: type
            });

            toast.success("✅ Congratulations! Payment successful");
            navigate("/dashboard");

          } catch (err) {
            toast.error("❌ Verification failed");
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
      toast.error("❌ Payment failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={container}>
      <h1>💳 Choose Subscription</h1>

      {/* Monthly */}
      <div style={card}>
        <h2>Monthly Plan</h2>

        <button
          onClick={() => handlePayment("monthly")}
          style={btn}
          disabled={
            loading ||
            (subscriptionStatus === "active" &&
              subscriptionType === "monthly")
          }
        >
          {subscriptionStatus === "active" &&
            subscriptionType === "monthly"
            ? "Already Subscribed🎉"
            : loading
              ? "Processing..."
              : "Subscribe Monthly"}
        </button>
      </div>

      {/* Yearly */}
      <div style={card}>
        <h2>Yearly Plan</h2>

        <button
          onClick={() => handlePayment("yearly")}
          style={btn}
          disabled={
            loading ||
            (subscriptionStatus === "active" &&
              subscriptionType === "yearly")
          }
        >
          {subscriptionStatus === "active" &&
            subscriptionType === "yearly"
            ? "Already Subscribed🎉"
            : loading
              ? "Processing..."
              : "Subscribe Yearly"}
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