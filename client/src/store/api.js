import axios from "axios";

const api = axios.create({
  // This will use your Render link in production and localhost in development
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
});

export default api;
