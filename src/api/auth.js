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

// Verify email OTP
export async function verifyOTP(data) {
  const response = await apiClient.post("/api/auth/verify-otp/", data);
  return response.data;
}

// Resend OTP to email
export async function resendOTP(data) {
  const response = await apiClient.post("/api/auth/resend-otp/", data);
  return response.data;
}
