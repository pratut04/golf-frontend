import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";

// 🔐 Protected Route
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

// 🔐 Admin Route
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  if (!token) return <Navigate to="/" />;
  if (email !== "secure@gmail.com") return <Navigate to="/dashboard" />;

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Login />} />

        {/* USER */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;