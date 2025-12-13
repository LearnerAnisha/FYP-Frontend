/**
 * VerifyOTP.jsx
 * -------------
 * This component handles email OTP verification as part of the
 * user authentication workflow.
 *
 * Responsibilities:
 * - Collect OTP from the user
 * - Verify OTP via backend API
 * - Mark user as verified
 * - Redirect user back to login page
 *
 * Design Considerations:
 * - Handles invalid navigation (missing email)
 * - Prevents unnecessary API calls
 * - Provides clear user feedback
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { verifyOTP } from "@/api/auth";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  // Email stored during registration step
  const email = localStorage.getItem("verify_email");

  /**
   * Redirect user if OTP page is accessed directly
   * without completing registration.
   */
  useEffect(() => {
    if (!email) {
      toast.error("Verification session expired. Please register again.");
      navigate("/auth");
    }
  }, [email, navigate]);

  /**
   * Handles OTP verification submission.
   */
  const handleVerify = async (e) => {
    e.preventDefault();

    // Frontend OTP validation
    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be a 6-digit number.");
      return;
    }

    try {
      await verifyOTP({ email, otp });

      toast.success("Email verified successfully!");

      // Cleanup verification state
      localStorage.removeItem("verify_email");

      // Redirect user back to login
      navigate("/auth");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "OTP verification failed."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <form
        onSubmit={handleVerify}
        className="space-y-4 w-80 p-6 bg-card rounded-xl shadow"
      >
        <h2 className="text-xl font-bold text-center">
          Verify Your Email
        </h2>

        <Input
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          inputMode="numeric"
          required
        />

        <Button type="submit" className="w-full">
          Verify OTP
        </Button>
      </form>
    </div>
  );
}
