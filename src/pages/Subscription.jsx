import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";

function Subscription() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [subscriptionType, setSubscriptionType] = useState(null);

  useEffect(() => {
    const checkSub = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) { navigate("/"); return; }

      try {
        const res = await API.post("/check-subscription", { user_id: userId });
        setSubscriptionStatus(res.data.status);
        setSubscriptionType(res.data.subscription_type);
      } catch (err) {
        console.error("SUB CHECK ERROR:", err);
      }
    };
    checkSub();
  }, [navigate]);

  const handlePayment = async (type) => {
    if (loading) return;
    try {
      setLoading(true);
      const amount = type === "yearly" ? 1000 : 100;
      const orderRes = await API.post("/create-order", { amount });
      const order = orderRes.data.data;

      if (!window.Razorpay) { toast.error("Razorpay not loaded ❌"); return; }

      const options = {
        key: "rzp_test_SXQLt37SiX7Arq",
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Golf App",
        description: `${type} subscription`,
        handler: async function (response) {
          try {
            await API.post("/verify-payment", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              type,
            });
            toast.success("✅ Congratulations! Payment successful");
            navigate("/dashboard");
          } catch (err) {
            toast.error("❌ Verification failed");
          }
        },
        theme: { color: "#22c55e" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("❌ Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const monthlyActive = subscriptionStatus === "active" && subscriptionType === "monthly";
  const yearlyActive  = subscriptionStatus === "active" && subscriptionType === "yearly";

  return (
    <div style={{ background: "linear-gradient(135deg, #0f172a, #020617)", minHeight: "100vh" }}>
      <Navbar />

      <div className="sub-page" style={{ background: "transparent" }}>
        <h1>💳 Choose Your Plan</h1>
        <p style={{ color: "#94a3b8", fontSize: "15px", marginBottom: "0" }}>
          Unlock all features and compete for the jackpot
        </p>

        <div className="sub-grid">

          {/* ---- Monthly ---- */}
          <div className="sub-card">
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📅</div>
            <h2>Monthly Plan</h2>
            <div className="sub-price">
              ₹100 <span>/ month</span>
            </div>

            <ul className="sub-features">
              <li>Submit golf scores each month</li>
              <li>Participate in monthly draw</li>
              <li>Select a charity to support</li>
              <li>View leaderboard rankings</li>
            </ul>

            <button
              className="sub-btn"
              onClick={() => handlePayment("monthly")}
              disabled={loading || monthlyActive}
            >
              {monthlyActive
                ? "✅ Already Subscribed"
                : loading
                ? "Processing…"
                : "Subscribe Monthly"}
            </button>

            {monthlyActive && (
              <p style={{ color: "#22c55e", fontSize: "13px", marginTop: "10px" }}>
                🎉 Your current active plan
              </p>
            )}
          </div>

          {/* ---- Yearly (highlighted) ---- */}
          <div
            className="sub-card"
            style={{
              border: "1px solid rgba(99,102,241,0.5)",
              boxShadow: "0 12px 40px rgba(99,102,241,0.2)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                background: "linear-gradient(135deg,#f59e0b,#facc15)",
                color: "#0f172a",
                fontSize: "11px",
                fontWeight: "700",
                padding: "3px 10px",
                borderRadius: "999px",
              }}
            >
              BEST VALUE
            </div>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🏆</div>
            <h2>Yearly Plan</h2>
            <div className="sub-price">
              ₹1000 <span>/ year</span>
            </div>

            <p style={{ color: "#22c55e", fontSize: "12px", marginTop: "-8px", marginBottom: "12px" }}>
              Save 17% vs monthly!
            </p>

            <ul className="sub-features">
              <li>Everything in Monthly</li>
              <li>12 months of draws</li>
              <li>Priority leaderboard entry</li>
              <li>Annual jackpot eligibility</li>
            </ul>

            <button
              className="sub-btn"
              onClick={() => handlePayment("yearly")}
              disabled={loading || yearlyActive}
            >
              {yearlyActive
                ? "✅ Already Subscribed"
                : loading
                ? "Processing…"
                : "Subscribe Yearly"}
            </button>

            {yearlyActive && (
              <p style={{ color: "#22c55e", fontSize: "13px", marginTop: "10px" }}>
                🎉 Your current active plan
              </p>
            )}
          </div>
        </div>

        <p
          style={{
            color: "#475569",
            fontSize: "13px",
            marginTop: "32px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </p>
      </div>
    </div>
  );
}

export default Subscription;