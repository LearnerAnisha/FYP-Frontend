import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { verifyOTP, resendOTP } from "@/api/auth";

const RESEND_COOLDOWN = 30;   // seconds
const MAX_RESENDS = 3;        // max resend attempts

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);         // seconds remaining
  const [resendCount, setResendCount] = useState(0);   // how many times resent
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const email = localStorage.getItem("verify_email");

  useEffect(() => {
    if (!email) {
      toast.error("Verification session expired. Please register again.");
      navigate("/auth");
    }
    return () => clearInterval(timerRef.current);
  }, [email, navigate]);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!/^\d{6}$/.test(otp)) {
      setErrorMsg("OTP must be a 6-digit number.");
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
      const msg =
        error.response?.data?.message || "Incorrect OTP. Please check and try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCount >= MAX_RESENDS) {
      setErrorMsg("Maximum resend attempts reached. Please try again after some time.");
      return;
    }

    setIsResending(true);
    setErrorMsg("");
    try {
      await resendOTP({ email });
      setResendCount((c) => c + 1);
      startCooldown();
      toast.success("A new OTP has been sent to your email.");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to resend OTP. Try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  const resendDisabled = isResending || cooldown > 0 || resendCount >= MAX_RESENDS;

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

        <div className="space-y-1">
          <Input
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            maxLength={6}
            inputMode="numeric"
            required
            className={errorMsg ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errorMsg && (
            <p className="text-sm text-red-500 font-medium">{errorMsg}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isVerifying}>
          {isVerifying ? "Verifying..." : "Verify OTP"}
        </Button>

        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the OTP?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendDisabled}
              className="text-primary underline font-medium hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending
                ? "Sending..."
                : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend OTP"}
            </button>
          </p>

          {/* Attempt counter */}
          {resendCount > 0 && resendCount < MAX_RESENDS && (
            <p className="text-xs text-muted-foreground">
              {MAX_RESENDS - resendCount} resend attempt{MAX_RESENDS - resendCount !== 1 ? "s" : ""} remaining
            </p>
          )}
          {resendCount >= MAX_RESENDS && (
            <p className="text-xs text-red-500">
              No resend attempts remaining. Please try again later.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}