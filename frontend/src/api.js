import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  signup: (userData) => api.post("/signup", userData),
  login: (credentials) => api.post("/login", credentials),
  getUsers: (searchParams) => api.get("/users", { params: searchParams }),
};

// Account APIs
export const accountAPI = {
  getBalance: () => api.get("/balance"),
  getTransactions: () => api.get("/transactions"),
  transfer: (transferData, idempotencyKey) => {
    const headers = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return api.post("/transfer", transferData, { headers });
  },
};

// Health check
export const healthAPI = {
  basic: () => axios.get("http://localhost:3000/"),
  detailed: () => axios.get("http://localhost:3000/healthz"),
};

export default api;
