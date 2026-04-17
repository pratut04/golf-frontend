
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Subscription from "./pages/Subscription";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// 🔥 ADMIN PAGES
import AdminUsers from "./components/AdminUsers";
import AdminScores from "./components/AdminScores";
import AdminCharities from "./components/AdminCharities";
import AdminWinnings from "./components/AdminWinnings";
import AdminLeaderboard from "./components/AdminLeaderboard";
// ================= ROUTES =================

// 🔐 Protected Route
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  const isGuest =
    localStorage.getItem("guest") === "true" && !token;

  return token || isGuest ? children : <Navigate to="/" />;
};

// 🔐 Admin Route
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  if (!token) return <Navigate to="/" />;
  if (email !== "secure@gmail.com") return <Navigate to="/dashboard" />;

  return children;
};

// 🌐 Public Route
const PublicRoute = ({ children }) => {
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ================= USER ================= */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* ================= SUBSCRIPTION ================= */}
        <Route
          path="/subscription"
          element={
            <PrivateRoute>
              <Subscription />
            </PrivateRoute>
          }
        />

        {/* ================= ADMIN (LAYOUT ROUTE) ================= */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        >
          {/* 🔥 NESTED ROUTES */}



          {/* Pages */}
          <Route path="users" element={<AdminUsers />} />
          <Route path="scores" element={<AdminScores />} />
          <Route path="charities" element={<AdminCharities />} />

          <Route path="winnings" element={<AdminWinnings />} />
          <Route path="leaderboard" element={<AdminLeaderboard />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
