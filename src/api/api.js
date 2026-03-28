import axios from "axios";

const API = axios.create({
  baseURL: "https://golf-backend-new.onrender.com"
});

export default API;
