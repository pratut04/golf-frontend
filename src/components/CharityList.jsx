import React from "react";

function CharityList({ charities, selectCharity, selectedId }) {
  return (
    <div style={card}>
      <h3>❤️ Charity Selection</h3>

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
                background: isSelected ? "#2e7d32" : "transparent"
              }}
            >
              <p>
                #{index + 1} {c.name}
              </p>

              <button
                style={{
                  ...btn,
                  background: isSelected ? "#888" : "#4caf50",
                  cursor: isSelected ? "not-allowed" : "pointer"
                }}
                disabled={isSelected}
                onClick={() => {
                  if (!isSelected) selectCharity(c.id); // ✅ safety
                }}
              >
                {isSelected ? "Selected ✅" : "Select"}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

export default CharityList;

// 🎨 styles
const card = {
  background: "#1e1e1e",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "15px",
  color: "white"
};

const item = {
  borderBottom: "1px solid #333",
  padding: "10px",
  borderRadius: "6px",
  marginBottom: "8px"
};

const btn = {
  padding: "6px 10px",
  border: "none",
  borderRadius: "6px",
  color: "white"
};