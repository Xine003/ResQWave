import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, Eye, EyeOff, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AccountSettingsModalProps } from '../types/accountSettings';
import { isAccountFormDirty, validatePassword } from '../utils/passwordUtils';

export default function AccountSettingsModal({ open, onClose, onSaved, center = null, isDirtyRef = null }: AccountSettingsModalProps) {
    // View state - 'profile' or 'password'
    const [view, setView] = useState<'profile' | 'password'>('profile');

    // Profile form state
    const [firstName, setFirstName] = useState('Gwyneth');
    const [lastName, setLastName] = useState('Uy');
    const [phoneNumber, setPhoneNumber] = useState('968 734 2038');
    const [email, setEmail] = useState('');

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
        setView('profile');
        setFirstName('Gwyneth');
        setLastName('Uy');
        setPhoneNumber('968 734 2038');
        setEmail('');
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
        if (view === 'password') {
            isDirtyRef.current = () => isAccountFormDirty(currentPassword, newPassword, confirmPassword);
        } else {
            // For profile view, check if any fields changed from initial values
            isDirtyRef.current = () => {
                return firstName !== 'Gwyneth' || lastName !== 'Uy' || phoneNumber !== '968 734 2038' || email !== '';
            };
        }
    }, [view, currentPassword, newPassword, confirmPassword, firstName, lastName, phoneNumber, email, isDirtyRef]);

    if (!mounted) return null;

    // match History modal sizing: fixed height (85vh) and inner scroll area
    // Dynamic height for Profile Information view, fixed for Change Password
    const baseStyle: any = {
        width: 'min(780px, 96%)',
        minHeight: 80,
        background: '#0d0d0d',
        color: '#fff',
        borderRadius: 7,
        padding: '62px 75px',
        display: 'flex',
        flexDirection: 'column',
    };

    // If profile view, allow height to grow with content, else use fixed height for password view
    const modalStyle: any = center
        ? {
            ...baseStyle,
            position: 'fixed',
            left: center.x,
            top: center.y,
            transform: 'translate(-50%, -50%)',
            background: '#171717',
            ...(view === 'profile' ? { height: 'auto', maxHeight: '96vh', overflow: 'visible' } : { height: '75vh', overflow: 'auto' })
        }
        : {
            ...baseStyle,
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#171717',
            ...(view === 'profile' ? { height: 'auto', maxHeight: '96vh', overflow: 'visible' } : { height: '75vh', overflow: 'auto' })
        };

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

                {view === 'profile' ? (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, zIndex: 2 }}>
                            <h2 style={{ margin: 0, fontSize: 27, fontWeight: 800, letterSpacing: 0.6 }}>Profile Information</h2>
                        </div>

                        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', paddingRight: 6 }}>
                            {/* Profile Image */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                                <div style={{
                                    width: 129,
                                    height: 129,
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    background: '#232323',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
                                }}>
                                    <img
                                        src="https://avatars.githubusercontent.com/u/1?v=4"
                                        alt="Profile"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '50%'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Name Fields */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <label style={{ fontSize: 14, color: '#FFFFFF', display: 'block', marginBottom: 8 }}>First Name</label>
                                    <Input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName((e.target as HTMLInputElement).value)}
                                        style={{
                                            padding: '24px 17px',
                                            border: '1px solid #404040',
                                            borderRadius: 6,
                                            background: 'transparent',
                                            color: '#fff',
                                            fontSize: 15,
                                            height: 44
                                        }}
                                        className="bg-input/10 text-white"
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: 14, color: '#FFFFFF', display: 'block', marginBottom: 8 }}>Last Name</label>
                                    <Input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName((e.target as HTMLInputElement).value)}
                                        style={{
                                            padding: '24px 17px',
                                            border: '1px solid #404040',
                                            borderRadius: 6,
                                            background: 'transparent',
                                            color: '#fff',
                                            fontSize: 15,
                                            height: 44
                                        }}
                                        className="bg-input/10 text-white"
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 14, color: '#FFFFFF', display: 'block', marginBottom: 8 }}>Phone Number</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span className="flex items-center px-4 py-[12.5px] bg-[#171717] border border-[#404040] rounded-[6px] border: '1px solid #404040'">
                                        <img src="/public/Landing/phFlag.png" alt="PH" className="w-4 h-3 mr-2" />
                                        <span className="text-[#A3A3A3] text-[15px] font-medium">+63</span>
                                    </span>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Input
                                            type="text"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber((e.target as HTMLInputElement).value)}
                                            placeholder="Phone Number"
                                            style={{
                                                padding: '24px 17px',
                                                border: '1px solid #404040',
                                                borderRadius: 6,
                                                background: 'transparent',
                                                color: '#fff',
                                                fontSize: 15,
                                                height: 44,
                                                width: '100%'
                                            }}
                                            className="bg-input/10 text-white"
                                        />
                                        <span style={{
                                            position: 'absolute',
                                            right: 15,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#3b82f6',
                                            fontWeight: 600,
                                            fontSize: 15
                                        }}>VERIFIED</span>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ fontSize: 14, color: '#FFFFFF', display: 'block', marginBottom: 8 }}>Email</label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                                    placeholder="Email"
                                    style={{
                                        padding: '24px 17px',
                                        border: '1px solid #404040',
                                        borderRadius: 6,
                                        background: 'transparent',
                                        color: '#fff',
                                        fontSize: 15,
                                        height: 44
                                    }}
                                    className="bg-input/10 text-white"
                                />
                            </div>

                            {/* Save Changes Button */}
                            <button
                                onClick={() => {
                                    console.log('Save profile changes', { firstName, lastName, phoneNumber, email });
                                    handleClose();
                                    try { onSaved && onSaved(); } catch (e) { }
                                }}
                                disabled={!isDirtyRef?.current?.()}
                                style={{
                                    padding: '8px 24px',
                                    borderRadius: 6,
                                    background: isDirtyRef?.current?.() ? '#ffffff' : '#414141',
                                    color: isDirtyRef?.current?.() ? '#000' : '#171717',
                                    border: 'none',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: isDirtyRef?.current?.() ? 'pointer' : 'not-allowed',
                                    transition: 'background 0.15s',
                                    marginBottom: 24,
                                    width: 145,
                                    height: 40,
                                    alignSelf: 'flex-end'
                                }}
                                onMouseEnter={e => {
                                    if (isDirtyRef?.current?.()) e.currentTarget.style.background = '#e5e5e5';
                                }}
                                onMouseLeave={e => {
                                    if (isDirtyRef?.current?.()) e.currentTarget.style.background = '#ffffff';
                                }}
                            >
                                Save Changes
                            </button>

                            {/* Password Section */}
                            <div style={{
                                padding: '20px 0',
                                borderTop: '1px solid #2b2b2b',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 600, marginBottom: 4 }}>Password</div>
                                    <div style={{ fontSize: 13, color: '#9ca3af' }}>Last changed 3 months ago</div>
                                </div>
                                <button
                                    onClick={() => setView('password')}
                                    style={{
                                        padding: '8px 24px',
                                        width: 145,

                                        borderRadius: 6,
                                        background: '#ffffff',
                                        color: '#000',
                                        border: 'none',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'background 0.15s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#e5e5e5'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                                >
                                    Change
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0, zIndex: 2, marginBottom: 24 }}>
                            <button
                                onClick={() => setView('profile')}
                                aria-label="Back"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#BABABA',
                                    fontSize: 18,
                                    cursor: 'pointer',
                                    transition: 'color 0.18s, transform 0.18s',
                                    alignItems: 'center',
                                    height: 44,
                                    width: 44,
                                    justifyContent: 'center'
                                }}
                            >
                                <ArrowLeft size={22} />
                            </button>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h2 style={{ margin: 0, fontSize: 27, fontWeight: 800, letterSpacing: 0.6, lineHeight: '32px' }}>Change Password</h2>
                                <div style={{ color: '#BABABA', fontSize: 14, fontWeight: 400, marginTop: 6, lineHeight: '22px' }}>Last Updated: October 10, 2025</div>
                            </div>
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
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: hasSpecial ? '#fff' : '#A8A8A8' }}><span style={{ width: 18 }}>{hasSpecial ? <Check size={14} color="#22c55e" /> : <X size={14} color="#9ca3af" />}</span> Atleast one special character eg. !@#$%^*_</div>
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
                                    console.log('update password', { currentPassword, newPassword });
                                    setView('profile');
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
                    </>
                )}
            </div>
        </div>
    );
}