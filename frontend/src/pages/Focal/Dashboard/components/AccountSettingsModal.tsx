import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { AccountSettingsModalProps } from '../types/accountSettings';
import { validatePassword, isAccountFormDirty } from '../utils/passwordUtils';

export default function AccountSettingsModal({ open, onClose, onSaved, center = null, isDirtyRef = null }: AccountSettingsModalProps) {
    // Change password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Validation flags (derived from helper)
    const [hasMinLength, setHasMinLength] = useState(false);
    const [hasUpper, setHasUpper] = useState(false);
    const [hasLower, setHasLower] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasSpecial, setHasSpecial] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(false);

    useEffect(() => {
        const v = validatePassword(newPassword, confirmPassword);
        setHasMinLength(v.hasMinLength);
        setHasUpper(v.hasUpper);
        setHasLower(v.hasLower);
        setHasNumber(v.hasNumber);
        setHasSpecial(v.hasSpecial);
        setPasswordsMatch(v.passwordsMatch);
    }, [newPassword, confirmPassword]);

    // form reset helper (run when fully unmounted)
    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
        setHasMinLength(false);
        setHasUpper(false);
        setHasLower(false);
        setHasNumber(false);
        setHasSpecial(false);
        setPasswordsMatch(false);
    };

    // When user clicks the close button inside the modal, tell parent to close.
    // Parent's change to `open` drives the exit animation below.
    const handleClose = () => {
        try { onClose && onClose(); } catch (e) { }
    };

    // Animation mount/show state
    const ANIM_MS = 220;
    const [mounted, setMounted] = useState(open);
    const [visible, setVisible] = useState(open);

    useEffect(() => {
        let t: any;
        if (open) {
            setMounted(true);
            // next frame to allow CSS transition
            requestAnimationFrame(() => setVisible(true));
        } else {
            // start exit animation
            setVisible(false);
            t = setTimeout(() => {
                setMounted(false);
                // only reset the form after we've finished animating out
                resetForm();
            }, ANIM_MS + 20);
        }
        return () => { if (t) clearTimeout(t); };
    }, [open]);

    // expose dirty-check to parent via optional ref
    useEffect(() => {
        if (!isDirtyRef) return;
        isDirtyRef.current = () => isAccountFormDirty(currentPassword, newPassword, confirmPassword);
    }, [currentPassword, newPassword, confirmPassword, isDirtyRef]);

    if (!mounted) return null;

    // match History modal sizing: fixed height (85vh) and inner scroll area
    const baseStyle: any = {
        width: 'min(780px, 96%)',
        height: '75vh', // fixed height so header/controls remain fixed
        minHeight: 80,
        overflow: 'auto', // allow inner content to be visible and only inner area will scroll
        background: '#0d0d0d',
        color: '#fff',
        borderRadius: 7,
        padding: '62px 75px',
        display: 'flex',
        flexDirection: 'column',
    };

    const modalStyle: any = center
        ? { ...baseStyle, position: 'fixed', left: center.x, top: center.y, transform: 'translate(-50%, -50%)', background: '#171717' }
        : { ...baseStyle, position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: '#171717' };

    const allRulesSatisfied = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch;

    const overlayStyle: any = {
        position: 'fixed', inset: 0, zIndex: 'var(--z-popover)',
        background: visible ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0)',
        transition: `background ${ANIM_MS}ms ease`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    };

    const animatedModalStyle = {
        ...modalStyle,
        transition: `transform ${ANIM_MS}ms cubic-bezier(.2,.9,.3,1), opacity ${ANIM_MS}ms ease`,
        transform: visible ? modalStyle.transform + ' scale(1)' : (modalStyle.transform + ' translateY(-8px) scale(0.98)'),
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
    };

    return (
        <div style={overlayStyle}>
            <div style={animatedModalStyle}>
                <button onClick={handleClose} aria-label="Close" style={{ position: 'absolute', right: 35, top: 30, background: 'transparent', border: 'none', color: '#BABABA', fontSize: 18, cursor: 'pointer', transition: 'color 0.18s, transform 0.18s' }}>✕</button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, zIndex: 2 }}>
                    <h2 style={{ margin: 0, fontSize: 27, fontWeight: 800, letterSpacing: 0.6 }}>Change Password</h2>
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 300, maxWidth: 640 }}>Protect your account with a strong unique password. We recommend changing your password regularly.</div>
                </div>

                <div style={{ marginTop: 28, display: 'grid', flex: 1, overflowY: 'auto', paddingRight: 6 }}>
                    <label style={{ fontSize: 14, color: '#FFFFFF' }}>Current Password</label>
                    <div style={{ position: 'relative' }}>
                        <Input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword((e.target as HTMLInputElement).value)} placeholder="" style={{ padding: '24px 46px 24px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 15 }} className="bg-input/10 text-white" />
                        <button onClick={() => setShowCurrent(s => !s)} aria-label={showCurrent ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 15, top: 0, bottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#8b8b8b', cursor: 'pointer', padding: '0 6px' }}>
                            {showCurrent ? <EyeOff size={19} /> : <Eye size={19} />}
                        </button>
                    </div>

                    <label style={{ fontSize: 14, color: '#FFFFFF', marginTop: 8 }}>New Password</label>
                    <div style={{ position: 'relative' }}>
                        <Input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword((e.target as HTMLInputElement).value)} placeholder="" style={{ padding: '24px 46px 24px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 15 }} className="bg-input/10 text-white" />
                        <button onClick={() => setShowNew(s => !s)} aria-label={showNew ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 15, top: 0, bottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#8b8b8b', cursor: 'pointer', padding: '0 6px' }}>
                            {showNew ? <EyeOff size={19} /> : <Eye size={19} />}
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                        <div style={{ color: '#BABABA', fontSize: 13 }}>
                            <div style={{ marginBottom: 8, color: '#FFFFFF' }}>Your password must contain:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: hasMinLength ? '#fff' : '#A8A8A8' }}><span style={{ width: 18 }}>{hasMinLength ? <Check size={14} color="#22c55e" /> : <X size={14} color="#9ca3af" />}</span> A minimum of 8 characters</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: hasUpper ? '#fff' : '#A8A8A8' }}><span style={{ width: 18 }}>{hasUpper ? <Check size={14} color="#22c55e" /> : <X size={14} color="#9ca3af" />}</span> Atleast one uppercase</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: hasLower ? '#fff' : '#A8A8A8' }}><span style={{ width: 18 }}>{hasLower ? <Check size={14} color="#22c55e" /> : <X size={14} color="#9ca3af" />}</span> Atleast one lowercase</div>
                            </div>
                        </div>
                        <div style={{ color: '#BABABA', fontSize: 13 }}>
                            <div style={{ height: 24 }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: hasNumber ? '#fff' : '#A8A8A8' }}><span style={{ width: 18 }}>{hasNumber ? <Check size={14} color="#22c55e" /> : <X size={14} color="#9ca3af" />}</span> Atleast one number</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: hasSpecial ? '#fff' : '#A8A8A8' }}><span style={{ width: 18 }}>{hasSpecial ? <Check size={14} color="#22c55e" /> : <X size={14} color="#9ca3af" />}</span> Atleast one special character eg. !@#$%^*</div>
                            </div>
                        </div>
                    </div>

                    <label style={{ fontSize: 14, color: '#FFFFFF', marginTop: 12 }}>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                        <Input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword((e.target as HTMLInputElement).value)} placeholder="" style={{ padding: '24px 46px 24px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 15 }} className="bg-input/10 text-white" />
                        <button onClick={() => setShowConfirm(s => !s)} aria-label={showConfirm ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 15, top: 0, bottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#8b8b8b', cursor: 'pointer', padding: '0 6px' }}>
                            {showConfirm ? <EyeOff size={19} /> : <Eye size={19} />}
                        </button>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <button disabled={!allRulesSatisfied} onClick={() => {
                            // TODO: call real API to change password
                            console.log('update password', { currentPassword, newPassword });
                            // close modal (also clears inputs)
                            handleClose();
                            // notify parent to show saved confirmation
                            try { onSaved && onSaved(); } catch (e) { }
                        }} className={
                            allRulesSatisfied
                                ? "w-full py-3 px-4 rounded-[6px] bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] transition-colors duration-150 hover:from-[#2563eb] hover:to-[#60a5fa] text-white font-semibold border border-[#2b2b2b]"
                                : "w-full py-3 px-4 rounded-[6px] bg-[#414141] text-[#9ca3af] font-semibold border border-[#2b2b2b] cursor-not-allowed"
                        } style={{
                            width: '100%',
                        }}>
                            Update Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
