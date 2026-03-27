import axios from "axios";

const API = axios.create({
  baseURL: "https://golf-backend-i5s7.onrender.com"
});

export default API;