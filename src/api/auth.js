import publicClient from "./publicClient";

// Register user
export async function registerUser(data) {
  const response = await publicClient.post("/api/auth/register/", data);
  return response.data;
}

// Login user
export async function loginUser(data) {
  const response = await publicClient.post("/api/auth/login/", data);
  return response.data;
}

// Verify email OTP
export async function verifyOTP(data) {
  const response = await publicClient.post("/api/auth/verify-otp/", data);
  return response.data;
}

// Resend OTP to email
export async function resendOTP(data) {
  const response = await publicClient.post("/api/auth/resend-otp/", data);
  return response.data;
}

// Forgot password — sends reset link to email
export async function forgotPassword(data) {
  const response = await publicClient.post("/api/auth/forgot-password/", data);
  return response.data;
}

// Reset password — validates token and sets new password
export async function resetPassword(data) {
  const response = await publicClient.post("/api/auth/reset-password/", data);
  return response.data;
}
