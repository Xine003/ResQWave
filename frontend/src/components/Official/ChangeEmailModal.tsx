import { useState } from "react";
import { X } from "lucide-react";
import VerifyEmailOTPModal from "./VerifyEmailOTPModal";

interface ChangeEmailModalProps {
    open: boolean;
    onClose: () => void;
    currentEmail: string;
}

export default function ChangeEmailModal({ open, onClose, currentEmail }: ChangeEmailModalProps) {
    const [email, setEmail] = useState("");
    const [showOTPModal, setShowOTPModal] = useState(false);

    if (!open) return null;

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isEmailValid = isValidEmail(email) && email !== currentEmail;

    const handleConfirm = () => {
        if (isEmailValid) {
            // TODO: Implement send OTP API call
            console.log("Sending OTP to:", email);
            setShowOTPModal(true);
        }
    };

    const handleVerifyOTP = (otp: string) => {
        // TODO: Implement verify OTP and update email API call
        console.log("Verifying OTP:", otp, "for email:", email);
        setShowOTPModal(false);
        handleClose();
    };

    const handleClose = () => {
        setEmail("");
        setShowOTPModal(false);
        onClose();
    };

    return (
        <div
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-[6px] px-8 md:px-4"
            onClick={(e) => {
                e.stopPropagation();
                handleClose();
            }}
        >
            <div
                className="relative w-full max-w-[560px] min-h-[200px] bg-[#171717] rounded-[6px] border border-[#404040] py-6 px-6 md:py-10 md:px-11 flex flex-col justify-center max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-4 md:mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm md:text-base font-semibold text-white mb-1">Change Email</h3>
                        <p className="text-xs md:text-[13px] text-[#A3A3A3]">Enter a new valid email to continue.</p>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="text-[#9ca3af] hover:text-white transition-colors ml-2 md:ml-4"
                        aria-label="Close"
                    >
                        <X size={16} className="md:w-[18px] md:h-[18px]" />
                    </button>
                </div>

                {/* Email Input */}
                <div className="mb-1">
                    <label className="block text-[13px] text-white mb-2">Email</label>
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={currentEmail}
                            className="w-full bg-[#171717] text-white text-sm px-3 py-2.5 rounded-[5px] border border-[#404040] focus:outline-none focus:border-[#4a4a4a]"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Confirm Button */}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleConfirm}
                        disabled={!isEmailValid}
                        className={`px-6 py-2 text-sm font-medium rounded transition-colors ${!isEmailValid
                                ? 'bg-[#414141] text-[#9ca3af] cursor-not-allowed'
                                : 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                            }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>

            {/* OTP Verification Modal */}
            <VerifyEmailOTPModal
                open={showOTPModal}
                onClose={() => setShowOTPModal(false)}
                email={email}
                onVerify={handleVerifyOTP}
            />
        </div>
    );
}
