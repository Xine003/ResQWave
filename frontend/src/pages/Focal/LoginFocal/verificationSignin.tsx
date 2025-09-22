import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordVerification } from "@/pages/Focal/LoginFocal/components/VerifyandForgot";

export default function VerificationSignin() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();

    function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        if (code.length < 6) {
            setError("Please enter the complete verification code.");
            return;
        }
        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            setError("");
            // Set dummy auth state
            window.isFocalAuthenticated = true;
            // Navigate to dashboard after successful verification
            navigate('/login-focal/focal-dashboard');
        }, 1200);
    }

    return (
        <ForgotPasswordVerification
            code={code}
            error={error}
            isVerifying={isVerifying}
            onCodeChange={val => {
                setCode(val);
                if (error) setError("");
            }}
            onVerify={handleVerify}
        />
    );
}
