import React, { useEffect, useState } from "react";
import API from "../api/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error("USERS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={card}>
      <h3 style={{ color: "#f1f5f9" }}>👥 User Management</h3>

      {!loading && (
        <p style={{ marginBottom: "10px", color: "#e5e7eb" }}>
          Total Users: <b style={{ color: "white" }}>{users.length}</b>
        </p>
      )}

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found</p>
      ) : (
        users
          .slice()
          .reverse()
          .map((u, index) => {
           
            const isYou = u.id == currentUserId;

            return (
              <div key={u.id} style={item}>
                #{index + 1} {u.email}

                {/* BADGE */}
                {isYou && (
                  <span style={youBadge}>
                    You
                  </span>
                )}
              </div>
            );
          })
      )}
    </div>
  );
}

export default AdminUsers;

//
//  STYLES
//

const card = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "20px",
  color: "#e5e7eb"
};

const item = {
  padding: "6px 0",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  display: "flex",
  alignItems: "center",
  color: "#e5e7eb"
};


const youBadge = {
  background: "#22c55e",
  color: "white",
  padding: "2px 8px",
  borderRadius: "6px",
  fontSize: "12px",
  marginLeft: "8px",
  fontWeight: "600"
};