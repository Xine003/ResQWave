import { useState } from "react";
import { X, Mail, Phone, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AccountSettingsModalProps {
    open: boolean;
    onClose: () => void;
}

export default function AccountSettingsModal({ open, onClose }: AccountSettingsModalProps) {
    const { user } = useAuth();
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(""); // You can fetch this from user data if available

    if (!open) return null;

    const handleSaveEmail = () => {
        // TODO: Implement email update API call
        setIsEditingEmail(false);
    };

    const handleSavePhone = () => {
        // TODO: Implement phone update API call
        setIsEditingPhone(false);
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl min-h-[600px] bg-[#1a1a1a] rounded-[6px] border border-[#404040] p-12"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-13 right-12 text-[#A3A3A3] hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <X size={22} />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white">Profile</h2>
                </div>

                {/* Profile Picture and Name */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-28 h-28 rounded-full bg-[#404040] mb-5 flex items-center justify-center">
                        <span className="text-[42px] font-bold text-[#9ca3af]">
                            {user?.name ? (() => {
                                const nameParts = user.name.trim().split(/\s+/);
                                if (nameParts.length >= 2) {
                                    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
                                }
                                return nameParts[0].charAt(0).toUpperCase();
                            })() : "U"}
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{user?.name || "User"}</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-normal bg-[#414141] text-[#A3A3A3] border border-gray-500/30">
                        ID: {user?.id || "N/A"}
                    </span>
                </div>

                {/* Account Information */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-white mb-3">Account Information</h4>

                    {/* Email and Phone on same line */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Email */}
                        <div className="py-4 px-[18px] bg-[#1f1f1f] rounded-[6px] border border-[#404040]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex-shrink-0 bg-[#404040] p-3 rounded-[6px]">
                                        <Mail className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[13px] text-[#BABABA] block">Email</label>
                                        {isEditingEmail ? (
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-[#1a1a1a] text-white text-sm px-2 py-1 rounded border border-[#404040] focus:outline-none focus:border-blue-500"
                                                autoFocus
                                            />
                                        ) : (
                                            <p className="text-[13px] text-white">{user?.email || "Not set"}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (isEditingEmail) {
                                            handleSaveEmail();
                                        } else {
                                            setIsEditingEmail(true);
                                        }
                                    }}
                                    className="ml-3 px-[13px] py-2 text-xs text-white hover:text-gray-300 transition-colors border border-[#404040] bg-[#262626] rounded-[4px] hover:border-gray-400"
                                >
                                    {isEditingEmail ? "Save" : "Edit"}
                                </button>
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="py-4 px-[18px] bg-[#1f1f1f] rounded-[6px] border border-[#404040]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex-shrink-0 bg-[#404040] p-3 rounded-[6px]">
                                        <Phone className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[13px] text-[#BABABA] block">Phone Number</label>
                                        {isEditingPhone ? (
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full bg-[#1a1a1a] text-white text-sm px-2 py-1 rounded border border-[#404040] focus:outline-none focus:border-blue-500"
                                                autoFocus
                                            />
                                        ) : (
                                            <p className="text-[13px] text-white">{phone || "Not set"}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (isEditingPhone) {
                                            handleSavePhone();
                                        } else {
                                            setIsEditingPhone(true);
                                        }
                                    }}
                                    className="ml-3 px-[13px] py-2 text-xs text-white hover:text-gray-300 transition-colors border border-[#404040] bg-[#262626] rounded-[4px] hover:border-gray-400"
                                >
                                    {isEditingPhone ? "Save" : "Edit"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="mb-8">
                    <h4 className="text-sm font-semibold text-white mb-3">Security</h4>
                    <div className="py-4 px-[18px] bg-[#1f1f1f] rounded-[6px] border border-[#404040]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="flex-shrink-0 bg-[#404040] p-3 rounded-[6px]">
                                    <Lock className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[13px] text-[#BABABA] block">Password</label>
                                    <p className="text-[13px] text-white">Last updated: January 10, 2025</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    // TODO: Implement password change modal/flow
                                    console.log("Change password");
                                }}
                                className="ml-3 px-[13px] py-2 text-xs text-white hover:text-gray-300 transition-colors border border-[#404040] bg-[#262626] rounded-[4px] hover:border-gray-400"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-[#BABABA]">
                        Need help? Contact{" "}
                        <button
                            onClick={() => {
                                // TODO: Implement support contact functionality
                                console.log("Contact support");
                            }}
                            className="underline hover:text-white transition-colors"
                        >
                            support
                        </button>{" "}
                        for assistance with your account.
                    </p>
                </div>
            </div>
        </div>
    );
}
