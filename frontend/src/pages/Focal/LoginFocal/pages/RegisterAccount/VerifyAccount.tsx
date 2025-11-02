import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FocalHeader } from "@/pages/Focal/LoginFocal/components/FocalHeader";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp-focal";
import { MessageSquareMore, Mail } from 'lucide-react';

export default function VerifyAccount() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const mode = searchParams.get('mode') || 'phone';
    const contact = searchParams.get('contact') || '';

    function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        if (code.length < 6) {
            setError("Please enter the complete verification code.");
            return;
        }
        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            // Navigate to information details page after successful verification
            navigate('/register/personal-info');
            setError("");
        }, 1200);
    }

    return (
        <div className="min-h-screen flex flex-col primary-background" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="loginfocal-radial-gradient" />
            <FocalHeader />
            <main className="flex flex-1 flex-col items-center w-full" style={{ marginTop: '120px', zIndex: 20, position: 'relative' }}>
                <div className="flex flex-col items-center gap-4 mb-8">
                    <span className="mb-4 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', width: '75px', height: '75px' }}>
                        {mode === 'phone' ? (
                            <MessageSquareMore className="text-[#3B82F6]" size={38} />
                        ) : (
                            <Mail className="text-[#3B82F6]" size={38} />
                        )}
                    </span>
                    <h1 className="text-[43px] font-medium leading-snug text-white mb-1">
                        {mode === 'phone' ? 'Verify Phone Number' : 'Verify Email'}
                    </h1>
                    <p className="text-[#BABABA] text-center mb-2 text-base max-w-lg leading-[30px]">
                        {mode === 'phone' ? (
                            <>
                                <span className="block mb-1">We've sent an SMS with an activation code to your phone</span>
                                <span className="block">(+63 {contact}).</span>
                            </>
                        ) : (
                            <>
                                <span className="block mb-1">We've sent an email with an activation code to your email</span>
                                <span className="block">({contact}).</span>
                            </>
                        )}
                    </p>
                </div>
                <form className="flex flex-col items-center gap-6 w-full max-w-[490px]" onSubmit={handleVerify}>
                    <div className="flex flex-col items-center" style={{ width: '464px', maxWidth: '100%' }}>
                        <InputOTP
                            maxLength={6}
                            value={code}
                            onChange={val => {
                                setCode(val);
                                if (error) setError("");
                            }}
                            containerClassName="justify-center mb-9 gap-4"
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} className={`bg-[#171717] h-[62px] w-[62px] text-2xl text-white border ${error ? 'border-red-500' : 'border-[#404040]'}`} />
                                <InputOTPSlot index={1} className={`bg-[#171717] h-[62px] w-[62px] text-2xl text-white border ${error ? 'border-red-500' : 'border-[#404040]'}`} />
                            </InputOTPGroup>
                            <InputOTPSeparator>
                                <span className="mx-4 text-white text-2xl">&bull;</span>
                            </InputOTPSeparator>
                            <InputOTPGroup>
                                <InputOTPSlot index={2} className={`bg-[#171717] h-[62px] w-[62px] text-2xl text-white border ${error ? 'border-red-500' : 'border-[#404040]'}`} />
                                <InputOTPSlot index={3} className={`bg-[#171717] h-[62px] w-[62px] text-2xl text-white border ${error ? 'border-red-500' : 'border-[#404040]'}`} />
                            </InputOTPGroup>
                            <InputOTPSeparator>
                                <span className="mx-4 text-white text-2xl">&bull;</span>
                            </InputOTPSeparator>
                            <InputOTPGroup>
                                <InputOTPSlot index={4} className={`bg-[#171717] h-[62px] w-[62px] text-2xl text-white border ${error ? 'border-red-500' : 'border-[#404040]'}`} />
                                <InputOTPSlot index={5} className={`bg-[#171717] h-[62px] w-[62px] text-2xl text-white border ${error ? 'border-red-500' : 'border-[#404040]'}`} />
                            </InputOTPGroup>
                        </InputOTP>
                        <div className="text-center text-gray-400 text-base mb-5 w-full">
                            Didn't receive any code? <button type="button" className="text-blue-400 hover:underline">Resend</button>
                        </div>
                        <Button
                            type="submit"
                            disabled={isVerifying || code.length < 6}
                            className={`w-[535px] py-6 rounded-md font-medium text-base mt-2 transition-all duration-200 flex items-center justify-center gap-2 ${code.length < 6 ? 'bg-[#232323] text-[#929090] cursor-not-allowed' : 'text-white hover:brightness-90'} `}
                            style={{
                                background: code.length < 6 ? '#232323' : 'linear-gradient(0deg, #3B82F6 0%, #70A6FF 100%)',
                                color: code.length < 6 ? '#929090' : undefined,
                                opacity: code.length < 6 ? 1 : (isVerifying ? 0.6 : 1)
                            }}
                        >
                            {isVerifying && (
                                <span className="inline-block mr-2">
                                    <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                </span>
                            )}
                            {isVerifying ? 'Verifying...' : 'Verify'}
                        </Button>

                        <Button
                            type="button"
                            onClick={() => navigate('/register-focal')}
                            className="text-[#BABABA] bg-transparent border-none cursor-pointer hover:text-white hover:bg-transparent mt-6"
                        >
                            Back
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}