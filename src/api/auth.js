import apiClient from "./client";

// Register user
export async function registerUser(data) {
  const response = await apiClient.post("/api/auth/register/", data);
  return response.data;
}

// Login user
export async function loginUser(data) {
  const response = await apiClient.post("/api/auth/login/", data);
  return response.data;
}

// Verifies email OTP submitted by the user.
export async function verifyOTP(data) {
  const response = await apiClient.post("/api/auth/verify-otp/", data);
  return response.data;
}
