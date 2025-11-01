// import { Button } from '@/components/ui/button';
import { DropdownIcon } from '@/components/ui/DropdownIcon';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog-focal';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/pages/Official/Reports/api/api';
import { Trash, Upload } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useFocalAuth } from '../../context/focalAuthContext';
import { useCommunityDataContext } from '../context/CommunityDataContext';

type EditAboutProps = {
    open: boolean;
    onClose: () => void;
    onSave?: (data: any) => void;
    center?: { x: number; y: number } | null;
};
export type EditAboutHandle = {
    openDiscardConfirm: (onContinue?: () => void) => void;
}

// Ranges for dropdowns
const householdsRanges = [
    '1-10',
    '11-50',
    '51-100',
    '101-200',
    '201-500',
    '500+',
];
const residentsRanges = [
    '1-100',
    '100-200',
    '200-300',
    '300-400',
    '400-500',
    '500+',
];
const floodwaterRanges = [
    'Less than 1 hour',
    '1-2 hours',
    '2-4 hours',
    '4-8 hours',
    '8-24 hours',
    'More than 24 hours',
];


const EditAbout = forwardRef<EditAboutHandle, EditAboutProps>(({ open, onClose, onSave, center = null }, ref) => {
    const ANIM_MS = 220;
    const [mounted, setMounted] = useState<boolean>(open);
    const [visible, setVisible] = useState<boolean>(open);



    // Dropdown state
    const [householdsRange, setHouseholdsRange] = useState("");
    const [householdsDropdownOpen, setHouseholdsDropdownOpen] = useState(false);
    const [residentsRange, setResidentsRange] = useState("");
    const [residentsDropdownOpen, setResidentsDropdownOpen] = useState(false);

    useEffect(() => {
        if (open) {
            setMounted(true);
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
            const t = setTimeout(() => setMounted(false), ANIM_MS);
            return () => clearTimeout(t);
        }
    }, [open]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
    // Main focal photo (not used for alt focal upload)
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    // Alt focal photo (for upload and display)
    const [altPhotoUrl, setAltPhotoUrl] = useState<string | null>(null);
    const [altPhotoFile, setAltPhotoFile] = useState<File | null>(null);
    // const fileInputRef = useRef<HTMLInputElement | null>(null);
    const mainFileInputRef = useRef<HTMLInputElement | null>(null);
    // expose imperative method to parent with optional continue callback
    const pendingContinueRef = useRef<(() => void) | null>(null);
    useImperativeHandle(ref, () => ({
        openDiscardConfirm: (onContinue?: () => void) => {
            pendingContinueRef.current = onContinue ?? null;
            setConfirmOpen(true);
        },
    }));
    // community data hook (shared mock store)
    const { data, refetch } = useCommunityDataContext();
    const { token } = useFocalAuth();

    // Local state for hazards (checkboxes)
    const [selectedHazards, setSelectedHazards] = useState<string[]>([]);

    // Keep selectedHazards in sync with backend data when modal opens or data changes
    useEffect(() => {
        if (open && Array.isArray(data?.hazards)) {
            setSelectedHazards(data.hazards);
        }
    }, [open, data?.hazards]);

    // editable fields (will be initialized from the shared hook when opened)
    const [groupName, setGroupName] = useState('');
    const [noOfResidents, setNoOfResidents] = useState<number>(0);
    const [noOfHouseholds, setNoOfHouseholds] = useState<number>(0);
    // Removed unused stats fields: kids, seniors, pregnant, pwds
    const [otherInfo, setOtherInfo] = useState('');

    // focal person
    const [focalName, setFocalName] = useState('');
    const [focalContact, setFocalContact] = useState('');
    const [focalEmail, setFocalEmail] = useState('');
    const [focalAddress, setFocalAddress] = useState('');
    const [focalCoordinates, setFocalCoordinates] = useState('');
    const [altFocalName, setAltFocalName] = useState('');
    const [altFocalContact, setAltFocalContact] = useState('');
    // New state for alt focal email (renamed for clarity)
    const [altFocalEmail, setAltFocalEmail] = useState('');

    const [floodwaterRange, setFloodwaterRange] = useState("");
    const [floodwaterDropdownOpen, setFloodwaterDropdownOpen] = useState(false);
    const householdsDropdownRef = useRef<HTMLDivElement>(null);
    const residentsDropdownRef = useRef<HTMLDivElement>(null);
    const floodwaterDropdownRef = useRef<HTMLDivElement>(null);

    // Only one dropdown open at a time
    const openDropdown = (dropdown: 'households' | 'residents' | 'floodwater') => {
        if (dropdown === 'households') {
            setHouseholdsDropdownOpen((prev) => !prev);
            setResidentsDropdownOpen(false);
            setFloodwaterDropdownOpen(false);
        } else if (dropdown === 'residents') {
            setResidentsDropdownOpen((prev) => !prev);
            setHouseholdsDropdownOpen(false);
            setFloodwaterDropdownOpen(false);
        } else if (dropdown === 'floodwater') {
            setFloodwaterDropdownOpen((prev) => !prev);
            setHouseholdsDropdownOpen(false);
            setResidentsDropdownOpen(false);
        }
    };

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                !householdsDropdownRef.current?.contains(event.target as Node) &&
                !residentsDropdownRef.current?.contains(event.target as Node) &&
                !floodwaterDropdownRef.current?.contains(event.target as Node)
            ) {
                setHouseholdsDropdownOpen(false);
                setResidentsDropdownOpen(false);
                setFloodwaterDropdownOpen(false);
            }
        }
        if (householdsDropdownOpen || residentsDropdownOpen || floodwaterDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [householdsDropdownOpen, residentsDropdownOpen, floodwaterDropdownOpen]);

    // Initialize local state from shared data when modal opens
    useEffect(() => {
        if (!open) return;
        if (!data) return;
        setGroupName(data?.groupName ?? '');
        // If value is a string (range), fallback to 0 for number input, dropdown will handle the string
        setNoOfResidents(typeof data?.stats?.noOfResidents === 'number' ? data.stats.noOfResidents : 0);
        setNoOfHouseholds(typeof data?.stats?.noOfHouseholds === 'number' ? data.stats.noOfHouseholds : 0);
        setOtherInfo(Array.isArray(data?.otherInfo) ? data.otherInfo.join('\n') : '');

        setFocalName(data?.focal?.name ?? '');
        setFocalContact(data?.focal?.contact ?? '');
        setFocalEmail(data?.focal?.email ?? '');
        setFocalAddress(data?.address ?? '');
        setFocalCoordinates(data?.coordinates ?? '');
        setAltFocalName(data?.altFocal?.name ?? '');
        setAltFocalContact(data?.altFocal?.contact ?? '');
        setAltFocalEmail(data?.altFocal?.email ?? '');
        setPhotoUrl(data?.focal?.photo ?? null);
        // Fetch alt focal photo from backend if available
        if (data?.groupName) {
            fetchAltFocalPhoto(data.groupName);
        } else {
            setAltPhotoUrl(null);
        }

        // Set dropdowns to show data if available
        setHouseholdsRange(data?.stats?.noOfHouseholds ? String(data.stats.noOfHouseholds) : '');
        setResidentsRange(data?.stats?.noOfResidents ? String(data.stats.noOfResidents) : '');
        setFloodwaterRange(data?.floodwaterSubsidenceDuration ?? '');
        // Hazards are now synced in a separate effect above
    }, [open, data?.stats?.noOfHouseholds, data?.stats?.noOfResidents, data?.floodwaterSubsidenceDuration, data?.hazards, data?.groupName]);

    // Fetch alt focal photo from backend
    const fetchAltFocalPhoto = async (neighborhoodId: string) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/neighborhood/${neighborhoodId}/alt-photo`, {
                credentials: 'include',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) return setAltPhotoUrl(null);
            const blob = await res.blob();
            setAltPhotoUrl(URL.createObjectURL(blob));
        } catch {
            setAltPhotoUrl(null);
        }
    };

    // revoke object URLs when photo changes / on unmount
    useEffect(() => {
        return () => {
            if (photoUrl && photoUrl.startsWith('blob:')) {
                try { URL.revokeObjectURL(photoUrl); } catch (e) { }
            }
        };
    }, [photoUrl]);

    // (image viewer utilities removed — not used in current UI)

    const baseStyle: any = {
        width: 'min(780px, 92%)',
        maxHeight: 'calc(85vh)',
        minHeight: 80,
        overflow: 'auto',
        background: '#0d0d0d',
        color: '#fff',
        borderRadius: 7,
        padding: '62px 75px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
    };

    const modalStyle: any = center
        ? { ...baseStyle, position: 'fixed', left: center.x, top: center.y, transform: 'translate(-50%, -50%)', background: '#171717' }
        : { ...baseStyle, position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#171717' };
    if (!mounted) return null;

    const overlayStyle: any = {
        position: 'fixed', inset: 0,
        background: visible ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0)',
        zIndex: 'var(--z-popover)',
        transition: `background ${ANIM_MS}ms ease`,
        pointerEvents: visible ? 'auto' : 'none',
    };

    const animatedModalStyle: any = {
        ...modalStyle,
        opacity: visible ? 1 : 0,
        transform: center
            ? `translate(-50%, -50%) translateY(${visible ? '0' : '-8px'})`
            : `${visible ? 'translateY(0)' : 'translateY(-8px)'}`,
        transition: `opacity ${ANIM_MS}ms ease, transform ${ANIM_MS}ms cubic-bezier(.2,.9,.2,1)`,
    };

    return (
        <div style={overlayStyle}>
            <div style={animatedModalStyle}>
                <button onClick={() => setConfirmOpen(true)} aria-label="Close" style={{ position: 'absolute', right: 35, top: 30, background: 'transparent', border: 'none', color: '#BABABA', fontSize: 18, cursor: 'pointer' }}>✕</button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 27, fontWeight: 800, letterSpacing: 0.6 }}>EDIT COMMUNITY</h2>
                        <div style={{ marginTop: 6, color: '#fff', fontSize: 13, fontWeight: 300 }}>Registered At: {data?.registeredAt ?? ''} <span style={{ fontWeight: 200, opacity: 0.5 }}> &nbsp; | &nbsp; </span> Last Updated At: {data?.updatedAt ?? ''}</div>
                    </div>
                </div>

                <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>

                    <div style={{ overflow: 'visible' }}>
                        {/* Focal persons header */}
                        <div style={{ marginTop: 10, marginBottom: 20, background: '#fff', color: '#111', padding: '10px 18px', borderRadius: 6, fontSize: 15, fontWeight: 600 }}>Neighborhood Information</div>

                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 15, fontWeight: 400, marginTop: 15 }}>No. of Households</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1, marginTop: 2, position: 'relative' }} ref={householdsDropdownRef}>
                                <button
                                    type="button"
                                    style={{ width: '100%', padding: '14px 17px', border: '1px solid #404040', borderRadius: 6, background: '#171717', color: '#fff', fontSize: 15, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                    onClick={() => openDropdown('households')}
                                >
                                    {householdsRange
                                        ? householdsRange
                                        : (data?.stats?.noOfHouseholds ? String(data.stats.noOfHouseholds) : <span style={{ color: '#A3A3A3' }}>Select a range</span>)}
                                    <span style={{ marginLeft: 8 }}><DropdownIcon open={householdsDropdownOpen} /></span>
                                </button>
                                {householdsDropdownOpen && (
                                    <ul style={{ position: 'absolute', zIndex: 10, marginTop: 2, width: '100%', background: '#171717', border: '1px solid #404040', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', listStyle: 'none', padding: 0 }}>
                                        {householdsRanges.map((r: string, idx: number) => (
                                            <li
                                                key={idx}
                                                style={{ padding: '12px 17px', color: '#fff', fontSize: 15, cursor: 'pointer', background: householdsRange === r ? '#232323' : 'transparent', transition: 'background 0.15s' }}
                                                onClick={() => { setHouseholdsRange(r); setHouseholdsDropdownOpen(false); }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#232323'}
                                                onMouseLeave={e => e.currentTarget.style.background = householdsRange === r ? '#232323' : 'transparent'}
                                            >
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 15, fontWeight: 400, marginTop: 15 }}>No. of Residents</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1, marginTop: 2, position: 'relative' }} ref={residentsDropdownRef}>
                                <button
                                    type="button"
                                    style={{ width: '100%', padding: '14px 17px', border: '1px solid #404040', borderRadius: 6, background: '#171717', color: '#fff', fontSize: 15, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                    onClick={() => openDropdown('residents')}
                                >
                                    {residentsRange
                                        ? residentsRange
                                        : (data?.stats?.noOfResidents ? String(data.stats.noOfResidents) : <span style={{ color: '#A3A3A3' }}>Select a range</span>)}
                                    <span style={{ marginLeft: 8 }}><DropdownIcon open={residentsDropdownOpen} /></span>
                                </button>
                                {residentsDropdownOpen && (
                                    <ul style={{ position: 'absolute', zIndex: 10, marginTop: 2, width: '100%', background: '#171717', border: '1px solid #404040', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', listStyle: 'none', padding: 0 }}>
                                        {residentsRanges.map((r: string, idx: number) => (
                                            <li
                                                key={idx}
                                                style={{ padding: '12px 17px', color: '#fff', fontSize: 15, cursor: 'pointer', background: residentsRange === r ? '#232323' : 'transparent', transition: 'background 0.15s' }}
                                                onClick={() => { setResidentsRange(r); setResidentsDropdownOpen(false); }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#232323'}
                                                onMouseLeave={e => e.currentTarget.style.background = residentsRange === r ? '#232323' : 'transparent'}
                                            >
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 15, fontWeight: 400, marginTop: 15 }}>Floodwater Subsidence Duration</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1, marginTop: 2, position: 'relative' }} ref={floodwaterDropdownRef}>
                                <button
                                    type="button"
                                    style={{ width: '100%', padding: '14px 17px', border: '1px solid #404040', borderRadius: 6, background: '#171717', color: '#fff', fontSize: 15, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                    onClick={() => openDropdown('floodwater')}
                                >
                                    {floodwaterRange
                                        ? floodwaterRange
                                        : (data?.floodwaterSubsidenceDuration ? data.floodwaterSubsidenceDuration : <span style={{ color: '#A3A3A3' }}>Select a range</span>)}
                                    <span style={{ marginLeft: 8 }}><DropdownIcon open={floodwaterDropdownOpen} /></span>
                                </button>
                                {floodwaterDropdownOpen && (
                                    <ul style={{ position: 'absolute', zIndex: 10, marginTop: 2, width: '100%', background: '#171717', border: '1px solid #404040', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', listStyle: 'none', padding: 0 }}>
                                        {floodwaterRanges.map((r: string, idx: number) => (
                                            <li
                                                key={idx}
                                                style={{ padding: '12px 17px', color: '#fff', fontSize: 15, cursor: 'pointer', background: floodwaterRange === r ? '#232323' : 'transparent', transition: 'background 0.15s' }}
                                                onClick={() => { setFloodwaterRange(r); setFloodwaterDropdownOpen(false); }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#232323'}
                                                onMouseLeave={e => e.currentTarget.style.background = floodwaterRange === r ? '#232323' : 'transparent'}
                                            >
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Flood-related Hazards and Notable Information */}
                    <div style={{ marginTop: 15 }}>
                        <div style={{ fontWeight: 400, fontSize: 15, marginBottom: 10, color: '#fff' }}>Flood-related Hazards</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 3 }}>
                            {[
                                "Strong water current (Malakas na agos ng tubig)",
                                "Risk of landslide or erosion (Panganib ng pagguho ng lupa)",
                                "Drainage overflow / canal blockage (Baradong kanal o daluyan ng tubig)",
                                "Roads become impassable (Hindi madaanan ang mga kalsada)",
                                "Electrical wires or exposed cables (Mga live o nakalatand na kable ng kuryente)"
                            ].map((hazard, idx) => {
                                // Check if this hazard is selected (case-insensitive)
                                const checked = selectedHazards.some((h: string) => h.toLowerCase() === hazard.toLowerCase());
                                return (
                                    <label key={idx} className="flex items-center gap-3 text-white text-base cursor-pointer select-none" style={{ marginBottom: 4 }}>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => {
                                                setSelectedHazards(prev => {
                                                    if (checked) {
                                                        // Remove
                                                        return prev.filter(h => h.toLowerCase() !== hazard.toLowerCase());
                                                    } else {
                                                        // Add
                                                        return [...prev, hazard];
                                                    }
                                                });
                                            }}
                                            className="sr-only"
                                        />
                                        <span
                                            className={`flex items-center justify-center h-3 w-3 rounded-[1px] ${checked ? 'bg-[#3B82F6]' : 'bg-[#414141]'}`}
                                            style={{ minWidth: '1rem', minHeight: '1rem' }}
                                        >
                                            {checked && (
                                                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M4 8L7 11L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </span>
                                        <span className="text-gray-300 text-[15px] leading-tight">{hazard}</span>
                                    </label>
                                );
                            })}
                        </div>
                        <div style={{ fontWeight: 400, fontSize: 15, marginBottom: 10, marginTop: 24, color: '#fff' }}>Notable Information</div>
                        <div style={{ background: '#181818', border: '1px solid #404040', borderRadius: 4, padding: 18, color: '#fff' }}>
                            <textarea
                                style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: 15, resize: 'none', outline: 'none' }}
                                rows={2}
                                placeholder="3 roads (St. Jhude, St. Perez, St. Lilia) are always blocked"
                                value={otherInfo}
                                onChange={e => setOtherInfo(e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Focal persons header */}
                    <div style={{ marginTop: 15, marginBottom: 10, background: '#fff', color: '#111', padding: '10px 18px', borderRadius: 6, fontSize: 15, fontWeight: 600 }}>Alternative Focal Person</div>


                    {altPhotoUrl ? (
                        <div style={{ background: '#0b0b0b', borderRadius: 6, display: 'flex', justifyContent: 'center' }}>
                            <div style={{ width: '100%', maxWidth: '100%', height: 240, borderRadius: 8, overflow: 'hidden', position: 'relative', backgroundColor: '#111' }}>
                                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${altPhotoUrl})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', filter: 'blur(18px) brightness(0.55)', transform: 'scale(1.2)' }} />
                                <img src={altPhotoUrl} alt="Alt Focal" style={{ position: 'relative', width: 'auto', height: '100%', maxWidth: '60%', margin: '0 auto', objectFit: 'contain', display: 'block' }} />
                                <button
                                    aria-label="Delete"
                                    onClick={() => {
                                        if (altPhotoUrl && altPhotoUrl.startsWith('blob:')) {
                                            try { URL.revokeObjectURL(altPhotoUrl); } catch (e) { }
                                        }
                                        setAltPhotoUrl(null);
                                        setAltPhotoFile(null);
                                    }}
                                    style={{ position: 'absolute', right: 15, bottom: 15, width: 36, height: 36, borderRadius: 1, background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                                    <Trash size={15} color="red" strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        // when empty: render a standalone dashed upload panel (no outer dark card)
                        <div style={{ marginTop: 6 }}>
                            <div onClick={() => mainFileInputRef.current?.click()} role="button" tabIndex={0} onKeyDown={() => mainFileInputRef.current?.click()} style={{ cursor: 'pointer', background: '#262626', padding: '28px', borderRadius: 8, border: '1px dashed #404040', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                <div style={{ background: '#1f2937', width: 48, height: 48, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Upload color="#60A5FA" />
                                </div>
                                <div style={{ color: '#fff', fontWeight: 700 }}>Upload photo</div>
                                <div style={{ color: '#9ca3af', fontSize: 12 }}>Drag and drop or click to upload</div>
                                <div style={{ color: '#9ca3af', fontSize: 12 }}>JPG and PNG, file size no more than 10MB</div>
                            </div>
                        </div>
                    )}

                    {/* hidden file input for main focal photo (kept outside so it's always present) */}
                    <input ref={mainFileInputRef} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        try {
                            const url = URL.createObjectURL(f);
                            if (altPhotoUrl && altPhotoUrl.startsWith('blob:')) {
                                try { URL.revokeObjectURL(altPhotoUrl); } catch (e) { }
                            }
                            setAltPhotoUrl(url);
                            setAltPhotoFile(f);
                        } catch (err) { }
                    }} />


                </div>


                {/* Alternative Focal Person Fields (new structure) */}
                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 30 }}>Name</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, marginTop: 2 }}>
                        <Input
                            value={altFocalName}
                            style={{ padding: '22px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }}
                            onChange={e => setAltFocalName(e.target.value)}
                            className="bg-input/10 text-white"
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1, marginTop: 2 }}>
                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 17 }}>Contact Number</div>
                        <Input
                            value={altFocalContact}
                            style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }}
                            onChange={e => setAltFocalContact(e.target.value)}
                            className="bg-input/10 text-white"
                        />
                    </div>
                    <div style={{ flex: 1, marginTop: 2 }}>
                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 17 }}>Email</div>
                        <Input
                            value={altFocalEmail}
                            style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }}
                            onChange={e => setAltFocalEmail(e.target.value)}
                            className="bg-input/10 text-white"
                        />
                    </div>
                </div>



                <div style={{ marginTop: 30, display: 'flex', gap: 12, width: '100%' }}>
                    <button
                        onClick={() => setConfirmSaveOpen(true)}
                        className="w-full bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] transition-colors duration-150 cursor-pointer hover:from-[#2563eb] hover:to-[#60a5fa] text-white py-3 px-4.5 rounded-md font-medium text-[15px] tracking-[0.6px] border-0"
                        style={{ width: '100%' }}
                    >
                        SAVE CHANGES
                    </button>
                </div>

                {/* Alert dialog for confirming leaving without saving */}
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will permanently discard your changes.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setConfirmOpen(false)} className="px-4 py-2 mt-3 bg-[#1b1b1b] text-white border border-[#3E3E3E] cursor-pointer transition duration-175 hover:bg-[#222222]" style={{ borderRadius: 8, fontSize: 15 }}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={() => {
                                setConfirmOpen(false);
                                // If parent supplied a continue action (e.g. navigate), call it.
                                if (pendingContinueRef.current) {
                                    try { pendingContinueRef.current(); } catch (e) { }
                                    pendingContinueRef.current = null;
                                } else {
                                    onClose();
                                }
                            }} className="px-4 py-2 mt-3 bg-[#fff] text-black hover:bg-[#e2e2e2] rounded cursor-pointer transition duration-175" style={{ borderRadius: 8, fontSize: 15 }}>
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Save confirmation dialog */}
                <AlertDialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Save changes?</AlertDialogTitle>
                            <AlertDialogDescription>Do you want to save your changes to the community information? This will update the community data.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setConfirmSaveOpen(false)} className="px-4 py-2 mt-3 bg-[#1b1b1b] text-white border border-[#3E3E3E] cursor-pointer transition duration-175 hover:bg-[#222222]" style={{ borderRadius: 8, fontSize: 15 }}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={async () => {
                                    if (!data?.groupName) return;
                                    try {
                                        // Compose payload for backend
                                        const payload = {
                                            noOfResidents: residentsRange ? residentsRange : (typeof data?.stats?.noOfResidents === 'string' ? data.stats.noOfResidents : ''),
                                            noOfHouseholds: householdsRange ? householdsRange : (typeof data?.stats?.noOfHouseholds === 'string' ? data.stats.noOfHouseholds : ''),
                                            floodSubsideHours: floodwaterRange ? floodwaterRange : (typeof data?.floodwaterSubsidenceDuration === 'string' ? data.floodwaterSubsidenceDuration : ''),
                                            hazards: selectedHazards,
                                            altFocal: {
                                                name: altFocalName,
                                                contact: altFocalContact,
                                                email: altFocalEmail,
                                            },
                                            otherInformation: otherInfo.split('\n').filter(line => line.trim() !== '').join('\n'),
                                        };
                                        await apiFetch(`/neighborhood/${data.groupName}`, {
                                            method: 'PUT',
                                            body: JSON.stringify(payload),
                                            headers: {
                                                'Authorization': token ? `Bearer ${token}` : '',
                                            },
                                        });
                                        // If alt focal photo was changed, upload it
                                        if (altPhotoFile) {
                                            const formData = new FormData();
                                            formData.append('alternativeFPImage', altPhotoFile);
                                            await fetch(`${import.meta.env.VITE_BACKEND_URL}/neighborhood/${data.groupName}/alt-photo`, {
                                                method: 'POST',
                                                credentials: 'include',
                                                headers: token ? { Authorization: `Bearer ${token}` } : {},
                                                body: formData,
                                            });
                                        }
                                        if (refetch) await refetch();
                                        onSave?.(payload);
                                        setConfirmSaveOpen(false);
                                        onClose();
                                    } catch (e) {
                                        alert('Failed to update community info.');
                                    }
                                }}
                                className="px-4 py-2 mt-3  bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] text-white hover:from-[#2563eb] hover:to-[#60a5fa] cursor-pointer transition duration-175"
                                style={{ borderRadius: 8, fontSize: 15 }}
                            >
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

        </div>
    );
});

export default EditAbout;
