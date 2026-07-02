
import axios from "axios";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://golf-backend-new.onrender.com"
    : "http://localhost:5000";

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 20000, // slightly longer to allow Render cold start
});

// Attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  // Don't override FormData
  if (!(req.data instanceof FormData)) {
    req.headers["Content-Type"] = "application/json";
  }

  return req;
});

// Helper: delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: retry a request up to `retries` times
const retryRequest = async (config, retries = 3, delayMs = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios({ ...config, baseURL: BASE_URL });
      return response;
    } catch (err) {
      // Only retry if it's a network error (no response = server sleeping)
      if (err.response) throw err; // real server error, don't retry
      if (attempt === retries) throw err; // all retries exhausted
      console.warn(`⏳ Server sleeping, retry ${attempt}/${retries} in ${delayMs / 1000}s…`);
      await delay(delayMs);
    }
  }
};

// Global response handler
API.interceptors.response.use(
  (res) => {
    console.log("✅ API:", res.config.url);
    return res;
  },
  async (err) => {
    console.log("❌ API ERROR:", err.response?.data || err.message);

    // Handle 401 globally
    if (err.response?.status === 401) {
      const isGuest = localStorage.getItem("guest") === "true";
      if (!isGuest) {
        localStorage.clear();
        window.location.href = "/";
      }
    }

    // No response = server is sleeping (Render cold start) → retry silently
    if (!err.response) {
      try {
        const retried = await retryRequest(err.config, 3, 5000);
        return retried;
      } catch (finalErr) {
        // All retries failed — only NOW show the alert
        alert("Server not responding after multiple attempts 🚨\nPlease wait a moment and refresh.");
        return Promise.reject(finalErr);
      }
    }

    return Promise.reject(err);
  }
);

export default API;