import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  // backend URL will come from .env
});

export default apiClient;
