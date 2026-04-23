import React from "react";

// 🔢 Count animation hook (clean + reusable)
function useCountUp(value, duration = 800) {
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);

    const counter = setInterval(() => {
      start += increment;

      if (start >= value) {
        setDisplay(value);
        clearInterval(counter);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [value, duration]);

  return display;
}

function KpiCard({
  title,
  value = 0,
  icon: Icon,
  highlight,
  positive,
  warning,
  isCurrency // ✅ NEW PROP
}) {
  const displayValue = useCountUp(value);

  return (
    <div
      style={{
        ...card,
        ...(highlight && highlightCard)
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.04)";
      }}
    >
      {/* ICON */}
      <div style={iconWrap}>
        {Icon && <Icon size={18} />}
      </div>

      {/* TITLE */}
      <div
        style={{
          ...label,
          color: highlight ? "rgba(255,255,255,0.85)" : "#64748b" // ✅ FIX
        }}
      >
        {title}
      </div>

      {/* VALUE */}
      <div
        style={{
          ...valueStyle,
          color:
            positive ? "#16a34a" :
              warning ? "#d97706" :
                title === "Charity Donations" ? "#ec4899" :  // 💖 pink
                  highlight ? "#fff" :
                    "#0f172a"
        }}
      >
        {isCurrency ? "₹" : ""}
        {Number(displayValue).toLocaleString("en-IN")}
      </div>
    </div>
  );
}

export default KpiCard;

//
// 🎨 STYLES
//

const card = {
  position: "relative",
  width: "100%",
  padding: "20px",
  borderRadius: "16px",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 16px rgba(0,0,0,0.04)",
  transition: "all 0.25s ease",
};
const highlightCard = {
  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
  color: "white",
};

const iconWrap = {
  position: "absolute",
  top: "14px",
  right: "14px",
  opacity: 0.7
};

const label = {
  fontSize: "13px",
  marginBottom: "8px",
};

const valueStyle = {
  fontSize: "26px",
  fontWeight: "700",
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "-0.5px"
};