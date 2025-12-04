import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2Icon, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { resetFocalPassword } from "../../api/authApi";

interface ResetPasswordProps {
  userID: number;
  code: string;
  onSuccess: () => void;
  onBack: () => void;
  onError: (message: string) => void;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function ResetPassword({
  userID,
  code,
  onSuccess,
  onBack,
  onError,
}: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password policy validation
  const validatePassword = (password: string): PasswordRequirement[] => {
    return [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
      { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
      { label: "At least one number", met: /[0-9]/.test(password) },
      {
        label: "At least one special character",
        met: /[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password),
      },
    ];
  };

  const requirements = validatePassword(newPassword);
  const allRequirementsMet = requirements.every((req) => req.met);
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allRequirementsMet) {
      onError("Password does not meet all requirements");
      return;
    }

    if (!passwordsMatch) {
      onError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await resetFocalPassword(userID, code, newPassword);
      // Clear session storage
      sessionStorage.removeItem("focalPasswordResetExpiry");
      sessionStorage.removeItem("focalPasswordResetUserID");
      sessionStorage.removeItem("focalPasswordResetMaskedEmail");
      sessionStorage.removeItem("focalPasswordResetEmailOrNumber");
      sessionStorage.removeItem("focalPasswordResetCode");
      onSuccess();
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number };
      if (error.status === 400) {
        onError(error.message || "Invalid request. Please try again.");
      } else if (error.status === 429) {
        onError("Too many attempts. Please try again later.");
      } else {
        onError(error.message || "Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <main className="flex flex-1 flex-col items-center w-full px-10 sm:px-0 mt-[120px] relative z-20">
        <div className="flex flex-col items-center gap-4 mb-8 w-full max-w-[460px] mx-auto">
          <h1 className="text-[2.6875rem] sm:text-[1.45rem] font-semibold text-white mb-1">
            Reset Password
          </h1>
          <p className="text-[#BABABA] text-center text-base sm:text-[0.82rem] mb-2 leading-relaxed">
            Protect your focal person account with a strong unique password. We
            <br />
            recommend following the password requirements below.
          </p>
        </div>

        <form
          className="flex flex-col gap-3 w-full max-w-[490px] mx-auto"
          onSubmit={handleSubmit}
        >
          <div className="mb-2">
            <label className="block text-white text-[15px] sm:text-[0.85rem] font-light mb-2">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-[#171717] border border-[#404040] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 h-[55px] sm:h-[38px] text-[16px] sm:text-[13px] w-full"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-white text-[15px] sm:text-[0.85rem] font-light mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-[#171717] border border-[#404040] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 h-[55px] sm:h-[38px] text-[16px] sm:text-[13px] w-full"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {/* Password match indicator */}
            {confirmPassword.length > 0 && (
              <div
                className={`text-sm mt-1 ${
                  passwordsMatch ? "text-green-400" : "text-red-400"
                }`}
              >
                {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
              </div>
            )}
          </div>

          {/* Password Requirements */}
          {newPassword.length > 0 && (
            <div className="mb-4 p-3 bg-[#27272A] rounded-lg border border-[#404040]">
              <h3 className="text-white text-sm font-medium mb-2">
                Password Requirements:
              </h3>
              <div className="space-y-1">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2Icon
                      className={`h-3 w-3 ${
                        req.met ? "text-green-400" : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        req.met ? "text-green-400" : "text-gray-400"
                      }`}
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onBack}
              className="flex-1 h-[52px] sm:h-[50px] bg-transparent border border-[#404040] text-white hover:bg-[#404040] hover:border-[#525252] rounded-xl text-[17px] sm:text-[16px] font-medium transition-all duration-200"
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 h-[52px] sm:h-[50px] bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1E40AF] hover:to-[#1E3A8A] text-white rounded-xl text-[17px] sm:text-[16px] font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!allRequirementsMet || !passwordsMatch || isLoading}
            >
              {isLoading ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}