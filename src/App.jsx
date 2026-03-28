import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Subscription from "./pages/Subscription"; // ✅ NEW

// Protected Route
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

// Admin Route
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  if (!token) return <Navigate to="/" />;
  if (!email || email !== "secure@gmail.com") {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Prevent login access if already logged in
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

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

        {/* ✅ SUBSCRIPTION */}
        <Route
          path="/subscription"
          element={
            <PrivateRoute>
              <Subscription />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;