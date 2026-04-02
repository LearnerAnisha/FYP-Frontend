import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";
import { getPaymentStatus } from "@/api/payment";
import { toast } from "sonner";

const MAX_POLLS = 8;    // maximum polling attempts
const POLL_MS = 2000; // interval between polls (ms)

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [uiState, setUiState] = useState("loading"); // loading | success | failed | timeout
  const [payment, setPayment] = useState(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const urlStatus = searchParams.get("status");   // "success" | "failed"
    const paymentId = sessionStorage.getItem("esewa_payment_id");

    // Immediately mark as failed if eSewa says so
    if (urlStatus === "failed" || !paymentId) {
      setUiState("failed");
      return;
    }

    let count = 0;
    let stopped = false;

    const poll = async () => {
      if (stopped) return;
      count++;
      setAttempts(count);

      try {
        const data = await getPaymentStatus(paymentId);
        setPayment(data);

        if (data.status === "COMPLETE") {
          setUiState("success");
          setTimeout(() => {
            window.location.href = "/dashboard/profile?tab=subscription";
          }, 1500);
          sessionStorage.removeItem("esewa_payment_id");
          sessionStorage.removeItem("esewa_transaction_uuid");
          toast.success("Payment successful! Your plan has been upgraded.");
          stopped = true;
          return;
        }

        if (data.status === "FAILED") {
          setUiState("failed");
          stopped = true;
          return;
        }

        // Still PENDING — keep polling
        if (count < MAX_POLLS) {
          setTimeout(poll, POLL_MS);
        } else {
          setUiState("timeout");
          stopped = true;
        }
      } catch (err) {
        console.error("Payment poll error:", err);
        if (count < MAX_POLLS) {
          setTimeout(poll, POLL_MS);
        } else {
          setUiState("timeout");
          stopped = true;
        }
      }
    };

    // Small initial delay — give the DRF backend time to finish verifying
    setTimeout(poll, 1800);

    return () => { stopped = true; };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-10 max-w-md w-full">
        {uiState === "loading" && <LoadingState attempts={attempts} />}
        {uiState === "success" && <SuccessState payment={payment} navigate={navigate} />}
        {uiState === "failed" && <FailedState navigate={navigate} />}
        {uiState === "timeout" && <TimeoutState navigate={navigate} />}
      </div>
    </div>
  );
}

/* ── Sub-states ─────────────────────────────────────────────────────────────── */

function LoadingState({ attempts }) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Verifying Payment…
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Please wait while we confirm your payment with eSewa.
          {attempts > 1 && (
            <span className="block mt-1 text-xs text-muted-foreground/70">
              Checking… (attempt {attempts} of 8)
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-3">
          ⚠️ Do not close or refresh this page.
        </p>
      </div>
      {/* Animated progress dots */}
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/40"
            style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

function SuccessState({ payment, navigate }) {
  return (
    <div className="flex flex-col items-center text-center gap-5">
      <div className="w-20 h-20 rounded-full bg-green-100 border-4 border-green-400 flex items-center justify-center shadow-lg shadow-green-100">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Payment Successful!
        </h2>
        <p className="text-muted-foreground text-sm">
          Your subscription has been upgraded successfully.
        </p>
      </div>

      {payment && (
        <div className="w-full bg-muted/40 rounded-xl p-4 space-y-2.5 text-left">
          <DetailRow label="Reference ID" value={payment.esewa_ref_id || "—"} />
          <DetailRow label="Amount Paid" value={`NPR ${Number(payment.total_amount).toLocaleString()}`} />
          <DetailRow label="Transaction ID" value={String(payment.transaction_uuid).slice(0, 18) + "…"} mono />
          <DetailRow label="Status" value="COMPLETE ✅" highlight />
        </div>
      )}

      <button
        onClick={() => navigate("/dashboard/profile?tab=subscription")}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 px-6 font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        View My Subscription <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function FailedState({ navigate }) {
  return (
    <div className="flex flex-col items-center text-center gap-5">
      <div className="w-20 h-20 rounded-full bg-red-100 border-4 border-red-400 flex items-center justify-center shadow-lg shadow-red-100">
        <XCircle className="w-10 h-10 text-red-600" />
      </div>

      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Payment Failed
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Your payment was not completed. You have <strong>not</strong> been charged.
          Please try again.
        </p>
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={() => navigate("/dashboard/profile?tab=subscription")}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 px-6 font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full flex items-center justify-center gap-2 bg-muted text-foreground rounded-xl py-3 px-6 font-semibold text-sm hover:bg-muted/80 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

function TimeoutState({ navigate }) {
  return (
    <div className="flex flex-col items-center text-center gap-5">
      <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-100">
        <AlertTriangle className="w-10 h-10 text-amber-600" />
      </div>

      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Verification Timed Out
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          We could not confirm your payment status in time.
          If money was deducted from your eSewa account, please check your eSewa app.
        </p>
        <p className="text-sm font-semibold text-foreground mt-3">
          Contact us at{" "}
          <a href="mailto:info@krishisaathi.com" className="text-primary underline underline-offset-2">
            info@krishisaathi.com
          </a>{" "}
          with your transaction details.
        </p>
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 px-6 font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Go to Dashboard
      </button>
    </div>
  );
}

/* ── Shared UI ── */
function DetailRow({ label, value, mono = false, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span className={`text-sm text-right font-medium
        ${mono ? "font-mono text-xs" : ""}
        ${highlight ? "text-green-600 font-bold" : "text-foreground"}
      `}>
        {value}
      </span>
    </div>
  );
}