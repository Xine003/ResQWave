import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordVerification } from "./components/forgotPasswordVerification";

export function VerificationOfficial() {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    // Mockup verification code for testing
    const CORRECT_CODE = "000000";

    function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        if (code.length < 6) {
            setError("Please enter the complete verification code.");
            return;
        }
        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            if (code === CORRECT_CODE) {
                // Successful verification - navigate to visualization
                navigate("/visualization");
            } else {
                // Invalid verification code
                setError("Invalid verification code. Please try again.");
            }
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