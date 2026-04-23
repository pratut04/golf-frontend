import React from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

function CharityList({ charities, selectCharity, selectedId }) {


  // change to production URL when deploying
  const [preview, setPreview] = React.useState(null);

  const handleDonate = async (charity) => {
    try {
      const amount = prompt("Enter donation amount:");

      if (!amount || Number(amount) <= 0) {
        toast.error("Invalid amount");
        return;
      }

      const orderRes = await API.post("/create-order", {
        amount: Number(amount)
      });

      const order = orderRes.data.data;

      const options = {
        key: "rzp_test_SXQLt37SiX7Arq",
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,

        name: "Golf App Charity Donation",
        description: `Donation for ${charity.name}`,

        handler: async function (response) {
          try {
            await API.post("/donate-charity", {
              razorpay_payment_id:
                response.razorpay_payment_id,

              razorpay_order_id:
                response.razorpay_order_id,

              razorpay_signature:
                response.razorpay_signature,

              charity_name: charity.name,
              amount: Number(amount)
            });

            toast.success(
              `❤️ Donated ₹${amount} to ${charity.name}`
            );

          } catch (err) {
            toast.error("Donation verification failed");
          }
        },

        theme: {
          color: "#22c55e"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      toast.error("Donation failed");
    }
  };



  return (
    <div style={card}>
      {/* ❤️ Main Message */}
      <div
        style={{
          background: "linear-gradient(135deg, #fff1f2, #ffe4e6)",
          padding: "12px 16px",
          borderRadius: "12px",
          marginBottom: "10px",
          borderLeft: "4px solid #e11d48",
          boxShadow: "0 3px 8px rgba(0,0,0,0.04)"
        }}
      >
        <h4 style={{ color: "#be123c", marginBottom: "4px", fontSize: "18px" }}>
          ❤️ Your Impact Matters
        </h4>

        <p style={{ color: "#374151", lineHeight: "1.4", fontSize: "14px" }}>
          Make a difference in someone's life by supporting a cause you care about.
          Select a charity below and click <b>Donate Now</b> if you wish to help people in need ❤️
        </p>
      </div>


      {/* 💚 Win Message */}
      <div
        style={{
          background: "linear-gradient(135deg, #ecfdf5, #dcfce7)",
          padding: "12px 16px",
          borderRadius: "12px",
          marginBottom: "10px",
          borderLeft: "4px solid #16a34a",
          boxShadow: "0 3px 8px rgba(0,0,0,0.04)"
        }}
      >
        <h4 style={{ color: "#166534", marginBottom: "4px", fontSize: "18px" }}>
          💚 Win & Give Back
        </h4>

        <p style={{ color: "#374151", lineHeight: "1.4", fontSize: "14px" }}>
          Choose a charity below today, and if you become a winner,
          <b> 10% of your approved winning amount</b> will automatically
          help support that cause ❤️
        </p>
      </div>


      {/* 💛 Skip Message */}
      <div
        style={{
          background: "linear-gradient(135deg, #fefce8, #fef3c7)",
          padding: "12px 16px",
          borderRadius: "12px",
          marginBottom: "12px",
          borderLeft: "4px solid #f59e0b",
          boxShadow: "0 3px 8px rgba(0,0,0,0.04)"
        }}
      >
        <h4 style={{ color: "#92400e", marginBottom: "4px", fontSize: "18px" }}>
          💛 Not interested in donating?
        </h4>

        <p style={{ color: "#374151", lineHeight: "1.4", fontSize: "14px" }}>
          No worries! If you don’t want to donate now and also don’t want
          10% of future winnings to go to charity, simply skip charity
          selection and continue forward ❤️
        </p>
      </div>

      {charities.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No charities available 😢</p>
      ) : (
        <div style={grid}>
          {charities.map((c, index) => {
            const isSelected = selectedId === c.id;
            return (
              <div
                key={c.id}
                style={{
                  ...item,
                  border: isSelected
                    ? "2px solid #22c55e"
                    : "1px solid #e2e8f0",
                  transform: isSelected ? "scale(1.02)" : "scale(1)"
                }}
              >
                {/* IMAGE */}
                <div
                  style={{
                    width: "100%",
                    height: "140px",
                    position: "relative"
                  }}
                >
                  {c.images?.length > 0 ? (
                    <Swiper
                      spaceBetween={0}
                      slidesPerView={1}
                      pagination={{ clickable: true }}
                      navigation={true}
                      modules={[Pagination, Navigation]}
                      style={{ width: "100%", height: "100%" }}
                    >
                      {c.images.map((imgObj, i) => (
                        <SwiperSlide key={imgObj.id}>
                          <img
                            src={imgObj.image}   // ✅ DIRECT CLOUDINARY URL
                            style={{
                              width: "100%",
                              height: "140px",
                              objectFit: "cover",
                              borderRadius: "8px"
                            }}
                            onClick={() => setPreview(imgObj.image)} // ✅ FIXED
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <img
                      src="https://dummyimage.com/80x80/cccccc/000000"
                      style={image}
                    />
                  )}
                </div>
                {/* NAME */}
                <h4 style={title}>
                  #{index + 1} {c.name}
                </h4>

                {/* DESCRIPTION */}
                <p style={desc}>
                  {c.description || "Helping people in need ❤️"}
                </p>

                {/* BUTTON */}
                <button
                  style={{
                    ...btn,
                    background: isSelected ? "#22c55e" : "#2563eb",
                    cursor: isSelected ? "not-allowed" : "pointer"
                  }}
                  disabled={isSelected}
                  onClick={() => {
                    if (!isSelected) selectCharity(c.id);
                  }}
                >
                  {isSelected ? "✅ Selected" : "Select Charity"}

                </button>
                <button
                  style={{
                    ...btn,
                    background: "#ec4899",
                    marginTop: "10px"
                  }}
                  onClick={() => handleDonate(c)}
                >
                  Donate Now ❤️
                </button>
              </div>
            );
          })}
        </div>
      )}

      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999
          }}
        >
          <img
            src={preview}
            alt="preview"
            onClick={(e) => e.stopPropagation()} // 🔥 IMPORTANT
            style={{
              maxWidth: "80%",
              maxHeight: "80%",
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
            }}
          />
        </div>
      )}
    </div>
  );
}

export default CharityList;

//
// 🎨 STYLES
//

const card = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "20px"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "15px"
};

const item = {
  background: "white",
  padding: "15px",
  borderRadius: "12px",
  textAlign: "center",
  transition: "0.2s",
  boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
};

const image = {
  width: "80px",
  height: "80px",
  borderRadius: "10px",
  objectFit: "cover",
  marginBottom: "10px"
};

const title = {
  marginBottom: "5px",
  fontSize: "16px",
  fontWeight: "600",
  color: "#0f172a"
};

const desc = {
  fontSize: "13px",
  color: "#64748b",
  marginBottom: "10px",
  minHeight: "35px"
};

const btn = {
  padding: "8px",
  width: "100%",
  border: "none",
  borderRadius: "8px",
  color: "white",
  fontWeight: "500"
};