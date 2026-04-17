
import axios from "axios";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://golf-backend-new.onrender.com"
    : "http://localhost:5000";

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000
});

//  Attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  // FIX: Don't override FormData
  if (!(req.data instanceof FormData)) {
    req.headers["Content-Type"] = "application/json";
  }

  return req;
});

//  Global response handler
API.interceptors.response.use(
  (res) => {
    console.log("✅ API:", res.config.url);
    return res;
  },
  (err) => {
    const error = err.response?.data?.error || err.message;

    console.log("❌ API ERROR:", error);

    if (err.response?.status === 401) {
      const isGuest = localStorage.getItem("guest") === "true";

      if (!isGuest) {
        localStorage.clear();
        window.location.href = "/";
      }
    }

    if (err.response?.status === 403) {
      alert(error || "Access denied ❌");
    }

    if (!err.response) {
      alert("Server not responding 🚨");
    }

    return Promise.reject(err);
  }
);

export default API;