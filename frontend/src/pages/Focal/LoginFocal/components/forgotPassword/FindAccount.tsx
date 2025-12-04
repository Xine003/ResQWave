import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { requestFocalPasswordReset } from "../../api/authApi";

interface FindAccountProps {
  onNext: (
    userID: number,
    maskedEmail: string,
    expiryTimestamp: number,
  ) => void;
  onBack: () => void;
  onError: (message: string) => void;
}

export function FindAccount({ onNext, onBack, onError }: FindAccountProps) {
  const [emailOrNumber, setEmailOrNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailOrNumber.trim()) {
      onError("Please enter your email or phone number");
      return;
    }

    setIsLoading(true);

    try {
      const response = await requestFocalPasswordReset(emailOrNumber.trim());

      // Calculate expiry timestamp
      const expiryTimestamp =
        Date.now() + response.expiresInMinutes * 60 * 1000;

      // Store in sessionStorage for persistence
      sessionStorage.setItem("focalPasswordResetExpiry", expiryTimestamp.toString());
      sessionStorage.setItem("focalPasswordResetUserID", response.userID.toString());
      sessionStorage.setItem("focalPasswordResetMaskedEmail", response.maskedEmail);
      sessionStorage.setItem(
        "focalPasswordResetEmailOrNumber",
        emailOrNumber.trim(),
      ); // Store original for resend

      onNext(response.userID, response.maskedEmail, expiryTimestamp);
    } catch (err: unknown) {
      const errorObj = err as { message?: string; status?: number };
      if (errorObj.status === 404) {
        setError("No account found with this email or phone number");
      } else if (errorObj.status === 500) {
        onError("Failed to send reset code. Please try again later");
      } else {
        onError(errorObj.message || "An error occurred. Please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <main
        className="flex flex-1 flex-col items-center w-full px-10 sm:px-0"
        style={{ marginTop: "120px", zIndex: 20, position: "relative" }}
      >
        <div
          className="flex flex-col items-center gap-4 mb-8"
          style={{
            width: "100%",
            maxWidth: window.innerWidth <= 480 ? "95vw" : "460px",
            marginLeft: "auto",
            marginRight: "auto",
            boxSizing: "border-box",
          }}
        >
          <h1
            className="text-[43px] font-semibold text-white mb-1"
            style={window.innerWidth <= 480 ? { fontSize: "1.45rem" } : {}}
          >
            Find your account
          </h1>
          <p
            className="text-[#BABABA] text-center text-base mb-2 leading-relaxed"
            style={window.innerWidth <= 480 ? { fontSize: "0.82rem" } : {}}
          >
            Enter your email address or your phone number to
            <br />
            recover your focal person account.
          </p>
        </div>

        <form
          className="flex flex-col gap-3 w-full mx-auto"
          style={{
            maxWidth: window.innerWidth <= 480 ? "95vw" : "490px",
            width: "100%",
            marginLeft: "auto",
            marginRight: "auto",
            boxSizing: "border-box",
          }}
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-3">
            <Input
              type="text"
              value={emailOrNumber}
              onChange={(e) => {
                setEmailOrNumber(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter email or phone number"
              className="h-[52px] text-[17px] bg-[#18181B] border border-[#404040] text-white placeholder:text-[#9CA3AF] rounded-xl focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all duration-200"
              style={{
                fontSize: window.innerWidth <= 480 ? "16px" : "17px",
                height: window.innerWidth <= 480 ? "50px" : "52px",
              }}
              disabled={isLoading}
            />
            {error && (
              <p className="text-red-400 text-sm ml-1">{error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onBack}
              className="flex-1 h-[52px] bg-transparent border border-[#404040] text-white hover:bg-[#404040] hover:border-[#525252] rounded-xl text-[17px] font-medium transition-all duration-200"
              style={{
                fontSize: window.innerWidth <= 480 ? "16px" : "17px",
                height: window.innerWidth <= 480 ? "50px" : "52px",
              }}
              disabled={isLoading}
            >
              Back to login
            </Button>
            <Button
              type="submit"
              className="flex-1 h-[52px] bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1E40AF] hover:to-[#1E3A8A] text-white rounded-xl text-[17px] font-medium transition-all duration-200 shadow-lg shadow-blue-500/25"
              style={{
                fontSize: window.innerWidth <= 480 ? "16px" : "17px",
                height: window.innerWidth <= 480 ? "50px" : "52px",
              }}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send code"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}