import axios from "axios";

const API = axios.create({
  baseURL: "https://golf-backend-new.onrender.com",
  timeout: 15000 // ✅ 15 sec timeout (important)
});

// ✅ Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// ✅ Global error handling
API.interceptors.response.use(
  (res) => res,
  (err) => {
    // 🔐 Unauthorized
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }

    // Network / server down
    if (!err.response) {
      alert("⚠️ Server is not responding. Please try again.");
    }

    return Promise.reject(err);
  }
);

export default API;