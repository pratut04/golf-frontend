import React, { useEffect, useState } from "react";
import API from "../api/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("USERS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={card}>
      <h3>👥 User Management</h3>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found</p>
      ) : (
        users.map((u, index) => (
          <div key={u.id} style={item}>
            #{index + 1} {u.email}
          </div>
        ))
      )}
    </div>
  );
}

export default AdminUsers;

// 🎨 styles
const card = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "20px",
  color: "white"
};

const item = {
  padding: "6px 0",
  borderBottom: "1px solid #333"
};