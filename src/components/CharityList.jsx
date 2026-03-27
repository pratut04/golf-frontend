import React from "react";
import API from "../api/api";

function CharityList({ charities, selectCharity }) {
  return (
    <div className="card">
      <h3>Charities</h3>

      {charities.map((c) => (
        <div className="item" key={c.id}>
          {c.name}
          <br />
          <button onClick={() => selectCharity(c.id)}>
            Select
          </button>
        </div>
      ))}
    </div>
  );
}

export default CharityList;