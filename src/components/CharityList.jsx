import React from "react";

function CharityList({ charities, selectCharity }) {
  return (
    <div style={card}>
      <h3>❤️ Charities</h3>

      {charities.length === 0 ? (
        <p>No charities available</p>
      ) : (
        charities.map((c) => (
          <div key={c.id} style={item}>
            <p>{c.name}</p>

            <button onClick={() => selectCharity(c.id)}>
              Select
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default CharityList;

const card = {
  background: "#1e1e1e",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "15px",
  color: "white"
};

const item = {
  borderBottom: "1px solid #333",
  padding: "10px 0"
};
