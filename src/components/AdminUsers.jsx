import React, { useEffect, useState } from "react";
import API from "../api/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={card}>
      <h3>👥 Users</h3>

      {users.map((u) => (
        <div key={u.id} style={item}>
          {u.email}
        </div>
      ))}
    </div>
  );
}

export default AdminUsers;

const card = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "20px"
};

const item = {
  padding: "6px 0",
  borderBottom: "1px solid #333"
};