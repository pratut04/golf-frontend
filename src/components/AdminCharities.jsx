import React, { useEffect, useState } from "react";
import API from "../api/api";

function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    loadCharities();
  }, []);

  const loadCharities = async () => {
    try {
      const res = await API.get("/charities");
      setCharities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addCharity = async () => {
    if (!name) return alert("Enter charity name");

    try {
      await API.post("/admin/charities", {
        name,
        description: "New charity",
        image: ""
      });

      alert("✅ Charity added");
      setName("");
      loadCharities();

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={card}>
      <h3>❤️ Charities</h3>

      <input
        placeholder="Charity name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={input}
      />

      <button onClick={addCharity} style={btn}>
        Add
      </button>

      {charities.map((c) => (
        <div key={c.id} style={item}>
          {c.name}
        </div>
      ))}
    </div>
  );
}

export default AdminCharities;

const card = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "20px"
};

const input = {
  padding: "8px",
  marginRight: "10px",
  borderRadius: "6px",
  border: "none"
};

const btn = {
  padding: "8px",
  background: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const item = {
  padding: "6px 0",
  borderBottom: "1px solid #333"
};
