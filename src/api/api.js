import axios from "axios";

const API = axios.create({
  baseURL: "https://golf-backend-new.onrender.com"
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// Handle errors globally (optional but pro)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // token expired / invalid
      localStorage.clear();
      window.location.href = "/";
    }

    return Promise.reject(err);
  }
);

export default API;