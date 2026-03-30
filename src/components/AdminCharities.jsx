import React, { useEffect, useState } from "react";
import API from "../api/api";

function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false); 

  useEffect(() => {
    loadCharities();
  }, []);

  const loadCharities = async () => {
    try {
      const res = await API.get("/charities");
      setCharities(res.data);
    } catch (err) {
      console.error("CHARITIES ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const addCharity = async () => {
    if (adding) return; // ✅ prevent double click

    if (!name.trim()) {
      alert("Enter charity name");
      return;
    }

    try {
      setAdding(true);

      await API.post("/charities", {
        name: name.trim(), // ✅ trim fix
        description: "Added by admin",
        image: ""
      });

      alert("✅ Charity added");

      setName("");
      loadCharities();

    } catch (err) {
      console.error("ADD CHARITY ERROR:", err);
      alert("Failed to add charity");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={card}>
      <h3>❤️ Charity Management</h3>

      {/* ADD CHARITY */}
      <div style={{ marginBottom: "10px" }}>
        <input
          placeholder="Enter charity name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={input}
        />

        <button onClick={addCharity} style={btn} disabled={adding}>
          {adding ? "Adding..." : "Add"}
        </button>
      </div>

      {/* LIST */}
      {loading ? (
        <p>Loading charities...</p>
      ) : charities.length === 0 ? (
        <p>No charities available</p>
      ) : (
        charities.map((c, index) => (
          <div key={c.id} style={item}>
            #{index + 1} {c.name}
          </div>
        ))
      )}
    </div>
  );
}

export default AdminCharities;

// 🎨 styles
const card = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "20px",
  color: "white"
};

const input = {
  padding: "8px",
  marginRight: "10px",
  borderRadius: "6px",
  border: "none"
};

const btn = {
  padding: "8px 12px",
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