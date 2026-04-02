import React from "react";

function CharityList({ charities, selectCharity, selectedId }) {
  return (
    <div style={card}>
      <h3 style={{color: "white"}}>Charity Selection</h3>

      {charities.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No charities available 😢</p>
      ) : (
        charities.map((c, index) => {
          const isSelected = selectedId === c.id;

          return (
            <div
              key={c.id}
              style={{
                ...item,
                background: isSelected ? "#f0fdf4" : "#f8fafc",
                border: isSelected
                  ? "2px solid #22c55e"
                  : "1px solid #e2e8f0"
              }}
            >
              <p>
                #{index + 1} {c.name}
              </p>

              <button
                style={{
                  ...btn,
                  background: isSelected ? "#22c55e" : "white",
                  color: isSelected ? "white" : "#16a34a",
                  border: "1px solid #22c55e",
                  cursor: isSelected ? "not-allowed" : "pointer"
                }}
                disabled={isSelected}
                onClick={() => {
                  if (!isSelected) selectCharity(c.id); // ✅ same logic
                }}
              >
                {isSelected ? "Selected ✓" : "Select"}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

export default CharityList;

//
// 🎨 LIGHT THEME STYLES
//

const card = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "12px",
  marginBottom: "15px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  color: "#0f172a"
};

const item = {
  padding: "14px",
  borderRadius: "10px",
  marginBottom: "10px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#f8fafc",
  border: "1px solid #e2e8f0"
};

const btn = {
  padding: "6px 12px",
  borderRadius: "6px",
  fontWeight: "500"
};