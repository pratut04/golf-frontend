import axios from "axios";

const API = axios.create({
   baseURL:  "https://golf-backend-new.onrender.com",
   //"http://localhost:5000",
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

    // 🔐 Unauthorized → logout
    if (err.response?.status === 401) {
      localStorage.clear();

      // safer redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    }

    // ⚠️ Network error (Render sleep)
    if (!err.response) {
      console.warn("Server not responding");
    }

    return Promise.reject(err);
  }
);

export default API;
