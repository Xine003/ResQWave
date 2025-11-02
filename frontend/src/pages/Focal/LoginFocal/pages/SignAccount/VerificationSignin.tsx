
import { ForgotPasswordVerification } from "@/pages/Focal/LoginFocal/components/VerifyandForgot";
import { apiFetch } from '@/pages/Official/Reports/api/api';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerificationSignin() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [lockoutMsg, setLockoutMsg] = useState<string | null>(null);
    const [lockoutUntil, setLockoutUntil] = useState<number | null>(null); // timestamp in ms
    const [checkingLock, setCheckingLock] = useState(true);
    const navigate = useNavigate();

    // Retrieve tempToken from navigation state (preferred), fallback to sessionStorage
    const location = useLocation();
    const tempToken = (location.state && location.state.tempToken) || sessionStorage.getItem('focalTempToken') || '';
    // Try to get emailOrNumber from navigation state or sessionStorage (if you store it)
    const emailOrNumber = (location.state && location.state.emailOrNumber) || sessionStorage.getItem('focalEmailOrNumber') || '';

    // On mount, check if account is locked (from login API)
    useEffect(() => {
        // Debug: show what emailOrNumber is
        console.log('VerificationSignin: emailOrNumber =', emailOrNumber);
        if (!emailOrNumber) {
            setCheckingLock(false);
            return;
        }
        setLockoutMsg(null);
        setLockoutUntil(null);
        setCheckingLock(true);
        apiFetch('/focal/login', {
            method: 'POST',
            body: JSON.stringify({ emailOrNumber, password: 'dummy' }),
        })
            .then((res) => {
                if (res.locked && res.message) {
                    setLockoutMsg(res.message);
                    // Try to get lockUntil from backend response (should be ms or ISO string)
                    if (res.lockUntil) {
                        let until = res.lockUntil;
                        if (typeof until === 'string') {
                            // Try to parse as ISO or number string
                            const parsed = Date.parse(until);
                            if (!isNaN(parsed)) setLockoutUntil(parsed);
                            else if (!isNaN(Number(until))) setLockoutUntil(Number(until));
                        } else if (typeof until === 'number') {
                            setLockoutUntil(until);
                        }
                    }
                } else {
                    setLockoutMsg(null);
                    setLockoutUntil(null);
                }
                setCheckingLock(false);
            })
            .catch(() => { setCheckingLock(false); });
        // Only run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Timer for lockout countdown
    const [lockoutCountdown, setLockoutCountdown] = useState<number | null>(null);
    useEffect(() => {
        if (!lockoutUntil) {
            setLockoutCountdown(null);
            return;
        }
        const updateCountdown = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((lockoutUntil - now) / 1000));
            setLockoutCountdown(diff);
        };
        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [lockoutUntil]);

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        if (code.length < 6) {
            setError("Please enter the complete verification code.");
            return;
        }
        setIsVerifying(true);
        setError("");
        setLockoutMsg(null);
        try {
            const res = await apiFetch<{ message: string; token?: string }>(
                '/focal/verify',
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
                navigate('/focal-dashboard');
            }
        } catch (err: any) {
            setIsVerifying(false);
            let msg = err?.message || 'Verification failed';
            let status = err?.status || err?.response?.status;
            // Try to parse JSON error
            try {
                const parsed = JSON.parse(msg);
                msg = parsed.message || msg;
            } catch { }
            // If forbidden, show lockout UI but do NOT block entry to this page
            if (msg && (msg.toLowerCase().includes('locked') || status === 403)) {
                setLockoutMsg(msg);
                // Try to get lockUntil from error response if present
                if (err?.lockUntil) {
                    let until = err.lockUntil;
                    if (typeof until === 'string') {
                        const parsed = Date.parse(until);
                        if (!isNaN(parsed)) setLockoutUntil(parsed);
                        else if (!isNaN(Number(until))) setLockoutUntil(Number(until));
                    } else if (typeof until === 'number') {
                        setLockoutUntil(until);
                    }
                }
                // Do NOT navigate away, just show modal
                return;
            }
            setError(msg);
        }
    }


    // Render the verification page as normal, but overlay a modal if locked
    return (
        <>
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
                hideTimer={!!lockoutMsg}
            />
            {lockoutMsg && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.65)',
                    zIndex: 100000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        background: '#18181b',
                        borderRadius: '16px',
                        padding: '2.5rem',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.38)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        maxWidth: 420,
                        width: '100%',
                    }}>
                        <h2 style={{ color: '#e11d48', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1rem' }}>Attempt Limit Reached</h2>
                        <p style={{ color: '#e5e7eb', textAlign: 'center', marginBottom: '1.2rem', fontSize: '1.08rem' }}>
                            You've reached the maximum number of verification attempts. Please try again later.
                        </p>
                        {lockoutCountdown !== null && lockoutCountdown > 0 && (
                            <div style={{ color: '#60a5fa', fontWeight: 500, fontSize: '1.08rem', marginBottom: '1.2rem', textAlign: 'center' }}>
                                You can retry in {Math.floor(lockoutCountdown / 60)}:{(lockoutCountdown % 60).toString().padStart(2, '0')} minutes.
                            </div>
                        )}
                        <button
                            style={{
                                marginTop: '1rem',
                                padding: '0.7rem 2.2rem',
                                background: '#3B82F6',
                                color: '#fff',
                                borderRadius: '8px',
                                fontWeight: 500,
                                fontSize: '1rem',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(59,130,246,0.18)'
                            }}
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}
        </>
    );

}
