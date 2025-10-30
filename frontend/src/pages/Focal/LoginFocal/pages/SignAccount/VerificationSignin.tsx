
import { apiFetch } from '@/lib/api';
import { ForgotPasswordVerification } from "@/pages/Focal/LoginFocal/components/VerifyandForgot";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFocalAuth } from '../../../context/focalAuthContext';

export default function VerificationSignin() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();
    const { setToken } = useFocalAuth();

    // Retrieve tempToken from navigation state (preferred), fallback to sessionStorage
    const location = useLocation();
    const tempToken = (location.state && location.state.tempToken) || sessionStorage.getItem('focalTempToken') || '';
    // Try to get emailOrNumber from navigation state or sessionStorage (if you store it)
    const emailOrNumber = (location.state && location.state.emailOrNumber) || sessionStorage.getItem('focalEmailOrNumber') || '';

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        if (code.length < 6) {
            setError("Please enter the complete verification code.");
            return;
        }
        setIsVerifying(true);
        setError("");
        try {
            const res = await apiFetch<{ message: string; token?: string }>(
                '/verifyFocalLogin',
                {
                    method: 'POST',
                    body: JSON.stringify({ tempToken, code }),
                }
            );
            setIsVerifying(false);
            // On success, use the FocalAuthContext to set the token
            if (res.token) {
                setToken(res.token);
            }
            navigate('/focal-dashboard');
        } catch (err: any) {
            setIsVerifying(false);
            let msg = err?.message || 'Verification failed';
            try {
                const parsed = JSON.parse(msg);
                msg = parsed.message || msg;
            } catch { }
            setError(msg);
        }
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
            tempToken={tempToken}
            emailOrNumber={emailOrNumber}
        />
    );
}
