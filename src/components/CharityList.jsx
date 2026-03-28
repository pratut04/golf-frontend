import React from "react";

function CharityList({ charities, selectCharity, selectedId }) {
  return (
    <div style={card}>
      <h3>Charities</h3>

      {charities.length === 0 ? (
        <p>No charities available</p>
      ) : (
        charities.map((c) => (
          <div
            key={c.id}
            style={{
              ...item,
              background: selectedId === c.id ? "#2e7d32" : "transparent"
            }}
          >
            <p>{c.name}</p>

            <button
              style={{
                ...btn,
                background:
                  selectedId === c.id ? "#aaa" : "#4caf50",
                cursor:
                  selectedId === c.id ? "not-allowed" : "pointer"
              }}
              disabled={selectedId === c.id}
              onClick={() => selectCharity(c.id)}
            >
              {selectedId === c.id ? "Selected ✅" : "Select"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default CharityList;

// styles
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
  borderRadius: "6px"
};

const btn = {
  padding: "6px 10px",
  border: "none",
  borderRadius: "6px",
  color: "white"
};
