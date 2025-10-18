import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Check, X, Info } from "lucide-react";

interface Step3CreatePasswordProps {
  onNext: (data: { password: string; confirmPassword: string }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

export function Step3CreatePassword({ onNext, onBack, isLoading = false }: Step3CreatePasswordProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRequirements: PasswordRequirement[] = [
    {
      label: "A minimum of 8 characters",
      regex: /.{8,}/,
      met: password.length >= 8
    },
    {
      label: "At least one uppercase",
      regex: /[A-Z]/,
      met: /[A-Z]/.test(password)
    },
    {
      label: "At least one number",
      regex: /\d/,
      met: /\d/.test(password)
    },
    {
      label: "At least one special character (ex. !@#$%*)",
      regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    },
    {
      label: "At least one lowercase",
      regex: /[a-z]/,
      met: /[a-z]/.test(password)
    }
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";
  const canProceed = allRequirementsMet && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canProceed) {
      onNext({ password, confirmPassword });
    }
  };

  return (
    <>
      {/* Main Content */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <h1 className="text-4xl font-semibold text-white mb-2 text-center">Create Password</h1>
      </div>


            <div className="flex flex-col gap-6 w-full max-w-[490px]">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                {/* Password Field */}
                <div>
                  <label className="block text-white text-sm font-medium mb-3">Password</label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#171717] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 text-base placeholder-gray-400"
                      style={{ fontSize: "16px", height: "48px" }}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-white text-sm font-medium mb-3">Confirm Password</label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-[#171717] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 text-base placeholder-gray-400"
                      style={{ fontSize: "16px", height: "48px" }}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

          {/* Password Requirements */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span className="text-white text-sm font-medium">Your password must contain:</span>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              {passwordRequirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-2">
                  {requirement.met ? (
                    <Check className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                  ) : (
                    <X className={`w-4 h-4 flex-shrink-0 ${requirement.met ? 'text-gray-400' : 'text-gray-400'}`} />
                  )}
                  <span className={`text-sm ${requirement.met ? 'text-gray-400' : 'text-gray-400'}`}>
                    {requirement.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 w-full mt-4">
            <Button
              type="submit"
              disabled={!canProceed || isLoading}
              className="text-white py-6 rounded-md font-medium text-base flex items-center justify-center gap-2
               bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] 
               hover:from-[#2C64C5] hover:to-[#2C64C5]
               disabled:opacity-50 disabled:cursor-not-allowed
               transition duration-300"
            >
              {isLoading && (
                <span className="inline-block mr-2">
                  <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                </span>
              )}
              {isLoading ? 'Processing...' : 'Next'}
            </Button>

            <Button
              type="button"
              onClick={onBack}
              className="text-[#BABABA] bg-transparent border-none cursor-pointer hover:text-white hover:bg-transparent mt-2"
            >
              Back
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}