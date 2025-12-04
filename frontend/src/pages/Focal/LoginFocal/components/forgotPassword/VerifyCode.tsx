import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp-focal";
import { useEffect, useRef, useState } from "react";
import { requestFocalPasswordReset, verifyFocalResetCode } from "../../api/authApi";

interface VerifyCodeProps {
  userID: number;
  maskedEmail: string;
  expiryTimestamp: number | null;
  onVerified: (code: string) => void;
  onBack: () => void;
  onResend: (newExpiryTimestamp: number) => void;
  onError: (message: string) => void;
}

export function VerifyCode({
  userID,
  maskedEmail,
  onVerified,
  onBack,
  onResend,
  onError,
}: VerifyCodeProps) {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [expiresIn, setExpiresIn] = useState(0);
  const [error, setError] = useState("");
  const [showResendAlert, setShowResendAlert] = useState(false);
  const [resendAlertTimer, setResendAlertTimer] =
    useState<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to get expiry timestamp from sessionStorage
  function getStoredExpiry() {
    const stored = sessionStorage.getItem("focalPasswordResetExpiry");
    if (stored) {
      const ts = parseInt(stored, 10);
      if (!isNaN(ts)) return ts;
    }
    return null;
  }

  // Timer logic: always use latest expiry from sessionStorage
  useEffect(() => {
    function getAndSetExpiry() {
      const expiry = getStoredExpiry();
      if (!expiry) return;
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setExpiresIn(diff);
      if (diff === 0) {
        sessionStorage.removeItem("focalPasswordResetExpiry");
      }
    }
    getAndSetExpiry();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(getAndSetExpiry, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // When resend is successful, reset expiry to 5 minutes from now and update timer immediately
  useEffect(() => {
    if (showResendAlert) {
      const newExpiry = Date.now() + 5 * 60 * 1000;
      sessionStorage.setItem("focalPasswordResetExpiry", newExpiry.toString());
      // Immediately update timer state and restart interval
      setExpiresIn(300);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const expiry = getStoredExpiry();
        if (!expiry) return;
        const now = Date.now();
        const diff = Math.max(0, Math.floor((expiry - now) / 1000));
        setExpiresIn(diff);
        if (diff === 0) {
          sessionStorage.removeItem("focalPasswordResetExpiry");
        }
      }, 1000);
    }
  }, [showResendAlert]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError(""); // Clear previous errors

    try {
      await verifyFocalResetCode(userID, code);
      // Store verified code in sessionStorage
      sessionStorage.setItem("focalPasswordResetCode", code);
      onVerified(code);
    } catch (err: unknown) {
      const errorObj = err as {
        message?: string;
        status?: number;
        data?: { message?: string; failedAttempts?: number; locked?: boolean };
      };

      if (errorObj.status === 429) {
        // Account locked
        onError(
          errorObj.message ||
            "Too many attempts. Account temporarily locked. Please try again later.",
        );
        setCode(""); // Clear code on lock
      } else if (errorObj.status === 400) {
        // Invalid code or expired - parse the error message
        const errorMessage =
          errorObj.message ||
          errorObj.data?.message ||
          "Invalid code. Please try again.";

        // Check if it's an expiry error
        if (errorMessage.toLowerCase().includes("expired")) {
          onError("Code has expired. Please request a new one.");
          setCode(""); // Clear code on expiry
        } else {
          // Invalid code
          setError(errorMessage);
          // Don't clear code - let user correct it
        }
      } else {
        onError(errorObj.message || "Verification failed. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    const originalEmailOrNumber = sessionStorage.getItem(
      "focalPasswordResetEmailOrNumber",
    );
    if (!originalEmailOrNumber) {
      onError("Unable to resend code. Please start over.");
      return;
    }

    setIsResending(true);

    try {
      const response = await requestFocalPasswordReset(originalEmailOrNumber);

      // Update stored expiry
      const newExpiryTimestamp =
        Date.now() + response.expiresInMinutes * 60 * 1000;
      sessionStorage.setItem(
        "focalPasswordResetExpiry",
        newExpiryTimestamp.toString(),
      );

      // Clear any existing timer for resend alert
      if (resendAlertTimer) {
        clearTimeout(resendAlertTimer);
      }

      // Trigger resend notification and timer update
      setShowResendAlert(true);
      onResend(newExpiryTimestamp);

      // Hide resend alert after 3 seconds
      const timer = setTimeout(() => {
        setShowResendAlert(false);
        setResendAlertTimer(null);
      }, 3000);
      setResendAlertTimer(timer);

      // Clear any entered code since new one is sent
      setCode("");
      setError("");
    } catch (err: unknown) {
      const errorObj = err as { message?: string; status?: number };
      onError(
        errorObj.message || "Failed to resend code. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (resendAlertTimer) {
        clearTimeout(resendAlertTimer);
      }
    };
  }, [resendAlertTimer]);

  return (
    <div>
      <main className="flex flex-1 flex-col items-center w-full px-10 sm:px-0 mt-[120px] relative z-20">
        <div className="flex flex-col items-center gap-4 mb-8 w-full max-w-[460px] mx-auto">
          <h1 className="text-[2.6875rem] sm:text-[1.45rem] font-semibold text-white mb-1">
            Verify your identity
          </h1>
          <p className="text-[#BABABA] text-center text-base sm:text-[0.82rem] mb-2 leading-relaxed">
            We sent a 6-digit verification code to{" "}
            <span className="text-white font-medium">{maskedEmail}</span>
            <br />
            Enter the code below to continue.
          </p>
        </div>

        <form
          className="flex flex-col gap-3 w-full max-w-[490px] mx-auto"
          onSubmit={handleVerify}
        >
          {/* Timer Display */}
          <div className="flex justify-center mb-2">
            {expiresIn > 0 ? (
              <div className="text-[#BABABA] text-sm">
                Code expires in{" "}
                <span className="text-blue-400 font-mono">
                  {formatTime(expiresIn)}
                </span>
              </div>
            ) : (
              <div className="text-red-400 text-sm">Code has expired</div>
            )}
          </div>

          {/* OTP Input */}
          <div className="flex justify-center mb-4">
            <InputOTP
              value={code}
              onChange={(value) => {
                setCode(value);
                if (error) setError("");
              }}
              maxLength={6}
              disabled={isVerifying}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && <p className="text-red-400 text-sm text-center mb-2">{error}</p>}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onBack}
              className="flex-1 h-[52px] sm:h-[50px] bg-transparent border border-[#404040] text-white hover:bg-[#404040] hover:border-[#525252] rounded-xl text-[17px] sm:text-[16px] font-medium transition-all duration-200"
              disabled={isVerifying}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 h-[52px] sm:h-[50px] bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1E40AF] hover:to-[#1E3A8A] text-white rounded-xl text-[17px] sm:text-[16px] font-medium transition-all duration-200 shadow-lg shadow-blue-500/25"
              disabled={isVerifying || code.length !== 6}
            >
              {isVerifying ? "Verifying..." : "Verify code"}
            </Button>
          </div>

          {/* Resend Section */}
          <div className="flex flex-col items-center gap-2 pt-4 border-t border-[#404040] mt-4">
            <p className="text-[#BABABA] text-sm">Didn't receive the code?</p>
            <Button
              type="button"
              onClick={handleResend}
              className="bg-transparent text-blue-400 hover:text-blue-300 underline h-auto p-0 text-sm font-medium"
              disabled={isResending || expiresIn > 240} // Allow resend in last 60 seconds or when expired
            >
              {isResending
                ? "Sending..."
                : expiresIn > 240
                  ? `Resend available in ${formatTime(expiresIn - 240)}`
                  : "Resend code"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}