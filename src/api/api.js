import axios from "axios";

const API = axios.create({
  baseURL:"https://golf-backend-new.onrender.com",                      //"http://localhost:5000",
  timeout: 15000
});

// ✅ Attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// ✅ Global response handler
API.interceptors.response.use(
  (res) => res,
  (err) => {

    console.log("API ERROR:", err.response?.data || err.message);

    // 🔐 Unauthorized → logout
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("email");

      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    }

    // ❌ DO NOT HANDLE 403 HERE

    // ⚠️ Network error
    if (!err.response) {
      console.warn("Server not responding");
    }

    return Promise.reject(err);
  }
);

export default API;