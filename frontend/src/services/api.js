
import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("iem_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.message = "The server took too long to respond.";
    } else if (!error.response) {
      error.message =
        "Cannot connect to the backend. Check that the server is running on port 5000.";
    }

    return Promise.reject(error);
  }
);

export default api;
