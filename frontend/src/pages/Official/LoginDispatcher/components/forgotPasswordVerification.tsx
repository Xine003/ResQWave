import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp-focal";
import { HeaderOfficial } from "./HeaderOfficial";

export function ForgotPasswordVerification({
    code,
    error,
    isVerifying,
    onCodeChange,
    onVerify,
}: {
    code: string;
    error: string;
    isVerifying: boolean;
    onCodeChange: (val: string) => void;
    onVerify: (e: React.FormEvent) => void;
}) {
    return (
        <div className="min-h-screen flex flex-col primary-background" style={{ position: 'relative', overflow: 'hidden' }}>
            <HeaderOfficial />
            <div className="loginfocal-radial-gradient" />
            <main className="flex flex-1 flex-col items-center justify-center w-full" style={{ marginTop: '0px', zIndex: 20, position: 'relative' }}>
                <div className="flex flex-col items-center gap-4 mb-8">
                    <h1 className="text-4xl font-semibold text-white mb-1">Enter verification code</h1>
                    <p className="text-[#BABABA] text-center mb-2 text-base max-w-lg">
                        <span className="block mb-1">We want to make sure your information stays safe and secure.</span>
                        <span className="block mb-1">Please enter the verification code we sent to your registered</span>
                        <span className="block">number/email to continue.</span>
                    </p>
                </div>
                <form className="flex flex-col items-center gap-6 w-full max-w-[490px]" onSubmit={onVerify}>
                    <div className="flex flex-col items-center" style={{ width: '464px', maxWidth: '100%' }}>
                        <InputOTP
                            maxLength={6}
                            value={code}
                            onChange={onCodeChange}
                            containerClassName="justify-center mb-9 gap-4"
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} className={`bg-[#171717] h-[65px] w-[65px] text-2xl text-white border ${error ? 'border-red-500' : 'border-[#404040]'}`} />
                                <InputOTPSlot index={1} className={`bg-[#171717] h-[65px] w-[65px] text-2xl text-white border ${error ? 'border-red-500' : 'border-[#404040]'}`} />
                            </InputOTPGroup>
                            <InputOTPSeparator>
                                <span className="mx-4 text-white text-2xl">&bull;</span>
                            </InputOTPSeparator>
                            <InputOTPGroup>
                                <InputOTPSlot index={2} className={`bg-[#171717] h-[65px] w-[65px] text-2xl text-white border ${error ? 'border-red-500' : 'border-[#404040]'}`} />
                                <InputOTPSlot index={3} className={`bg-[#171717] h-[65px] w-[65px] text-2xl text-white border ${error ? 'border-red-500' : 'border-[#404040]'}`} />
                            </InputOTPGroup>
                            <InputOTPSeparator>
                                <span className="mx-4 text-white text-2xl">&bull;</span>
                            </InputOTPSeparator>
                            <InputOTPGroup>
                                <InputOTPSlot index={4} className={`bg-[#171717] h-[65px] w-[65px] text-2xl text-white border ${error ? 'border-red-500' : 'border-[#404040]'}`} />
                                <InputOTPSlot index={5} className={`bg-[#171717] h-[65px] w-[65px] text-2xl text-white border ${error ? 'border-red-500' : 'border-[#404040]'}`} />
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
                    </div>
                </form>
            </main>
        </div>
    );
}
