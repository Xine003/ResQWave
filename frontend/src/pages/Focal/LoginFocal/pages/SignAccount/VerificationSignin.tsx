
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ForgotPasswordVerification } from "@/pages/Focal/LoginFocal/components/VerifyandForgot";
import { apiFetch } from '@/lib/api';

export default function VerificationSignin() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();

    // Retrieve tempToken from navigation state (preferred), fallback to sessionStorage
    const location = useLocation();
    const tempToken = (location.state && location.state.tempToken) || sessionStorage.getItem('focalTempToken') || '';

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
            // On success, store token if needed and navigate
            if (res.token) {
                localStorage.setItem('focalToken', res.token);
                // Decode JWT to get id (payload is base64 in the middle part)
                try {
                    const payload = JSON.parse(atob(res.token.split('.')[1]));
                    if (payload.id) {
                        localStorage.setItem('focalId', payload.id);
                    }
                } catch { }
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
        />
    );
}
