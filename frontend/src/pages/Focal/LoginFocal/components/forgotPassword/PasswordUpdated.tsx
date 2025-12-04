import { Button } from "@/components/ui/button";
import { CheckCircle2Icon } from "lucide-react";

interface PasswordUpdatedProps {
  onBackToLogin: () => void;
}

export function PasswordUpdated({ onBackToLogin }: PasswordUpdatedProps) {
  return (
    <div>
      <main className="flex flex-1 flex-col items-center justify-center w-full px-10 sm:px-0 mt-[120px] relative z-20">
        <div className="flex flex-col items-center gap-6 w-full max-w-[460px] mx-auto">
          {/* Success Icon */}
          <div className="relative animate-in zoom-in-95 fade-in duration-500">
            <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] p-6 w-[100px] sm:w-[80px] h-[100px] sm:h-[80px] shadow-[0_0_40px_rgba(59,130,246,0.3)]">
              <CheckCircle2Icon
                size={60}
                className="text-white sm:w-12 sm:h-12"
                strokeWidth={2.5}
              />
            </div>
          </div>

          <h1 className="text-[2.6875rem] sm:text-[1.75rem] font-semibold text-white mb-2 text-center">
            Password Updated
          </h1>

          <p className="text-[#BABABA] text-center text-base sm:text-[0.9rem] leading-relaxed mb-4">
            Your focal person account password has been changed successfully.
            <br />
            Use your new password to log in.
          </p>

          <Button
            onClick={onBackToLogin}
            className="text-white py-6 rounded-md font-medium text-base flex items-center justify-center gap-2 bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] hover:from-[#2C64C5] hover:to-[#2C64C5] transition duration-300 cursor-pointer mt-4 w-full max-w-[490px] sm:max-w-[260px] sm:text-[0.95rem]"
          >
            Back to Login
          </Button>
        </div>
      </main>
    </div>
  );
}