import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordVerification } from "./components/forgotPasswordVerification";

export function VerificationOfficial() {
    const navigate = useNavigate();
    const { verifyLogin } = useAuth();
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        if (code.length < 6) {
            setError("Please enter the complete verification code.");
            return;
        }

        setIsVerifying(true);
        try {
            const success = await verifyLogin(code);
            if (success) {
                navigate("/visualization");
            }
        } catch (error: unknown) {
            const err = error as { message?: string };
            setError(err.message || "Invalid verification code. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    }

    return (
        <ForgotPasswordVerification
            code={code}
            error={error}
            isVerifying={isVerifying}
            onCodeChange={(val: string) => {
                setCode(val);
                if (error) setError("");
            }}
            onVerify={handleVerify}
        />
    );
}