import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { verifyOTP, resendOTP } from "@/api/auth";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("verify_email");

  useEffect(() => {
    if (!email) {
      toast.error("Verification session expired. Please register again.");
      navigate("/auth");
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be a 6-digit number.");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyOTP({ email, otp });
      toast.success("Email verified successfully! You can now log in.");
      localStorage.removeItem("verify_email");
      navigate("/auth");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "OTP verification failed. Try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendOTP({ email });
      toast.success("A new OTP has been sent to your email.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to resend OTP. Try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <form
        onSubmit={handleVerify}
        className="space-y-4 w-80 p-6 bg-card rounded-xl shadow"
      >
        <h2 className="text-xl font-bold text-center">Verify Your Email</h2>

        <p className="text-sm text-center text-muted-foreground">
          Enter the 6-digit OTP sent to <strong>{email}</strong>
        </p>

        <Input
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          inputMode="numeric"
          required
        />

        <Button type="submit" className="w-full" disabled={isVerifying}>
          {isVerifying ? "Verifying..." : "Verify OTP"}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the OTP?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-primary underline font-medium hover:opacity-80 disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend OTP"}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
