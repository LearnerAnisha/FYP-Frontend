import axios from "axios";

const publicClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default publicClient;
