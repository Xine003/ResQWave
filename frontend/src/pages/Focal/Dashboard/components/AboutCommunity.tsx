import { useState, useEffect } from 'react';
import { useFocalAuth } from '../../context/focalAuthContext';
import { Expand, Minus, Plus, ZoomOut } from 'lucide-react';
import { useCommunityDataContext } from '../context/CommunityDataContext';

type AboutModalProps = {
    open: boolean;
    onClose: () => void;
    onEdit?: () => void;
    // optional viewport center to position the modal over the map
    center?: { x: number; y: number } | null;
};

export default function AboutModal({ open, onClose, onEdit, center = null }: AboutModalProps) {
    // Alt focal photo blob URL
    const [altPhotoUrl, setAltPhotoUrl] = useState<string | null>(null);

    const ANIM_MS = 220;
    const [mounted, setMounted] = useState<boolean>(open);
    const [visible, setVisible] = useState<boolean>(open);

    useEffect(() => {
        if (open) {
            setMounted(true);
            // ensure next frame so CSS transition can pick up the change
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
            const t = setTimeout(() => {
                setMounted(false);
            }, ANIM_MS);
            return () => clearTimeout(t);
        }
    }, [open]);


    // viewer hooks must be declared unconditionally to preserve hook order
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);
    const [viewerZoom, setViewerZoom] = useState(1);
    const [viewerRotate, setViewerRotate] = useState(0);


    // Always use the latest community data from the context (ensures About tab updates live)
    const { data, loading, error } = useCommunityDataContext();
    const { token, focalId } = useFocalAuth();

    // Fetch alt focal photo from backend when modal opens (must be after 'data' is declared)
    useEffect(() => {
        if (!open || !data?.groupName) {
            setAltPhotoUrl(null);
            return;
        }
        let revoked = false;
        const fetchAltFocalPhoto = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/neighborhood/${data.groupName}/alt-photo`, {
                    credentials: 'include',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) return setAltPhotoUrl(null);
                const blob = await res.blob();
                if (revoked) return;
                setAltPhotoUrl(URL.createObjectURL(blob));
            } catch {
                setAltPhotoUrl(null);
            }
        };
        fetchAltFocalPhoto();
        return () => {
            revoked = true;
            if (altPhotoUrl && altPhotoUrl.startsWith('blob:')) {
                try { URL.revokeObjectURL(altPhotoUrl); } catch (e) { }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, data?.groupName, token]);

    // Fetch focal person photo as blob from backend
    const [focalPhotoUrl, setFocalPhotoUrl] = useState<string | null>(null);
    useEffect(() => {
        const id = data?.focal?.id || focalId;
        if (!open || !id) {
            setFocalPhotoUrl(null);
            return;
        }
        let revoked = false;
        const fetchFocalPhoto = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/focalperson/${id}/photo`, {
                    credentials: 'include',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) {
                    setFocalPhotoUrl(null);
                    return;
                }
                const blob = await res.blob();
                if (revoked) return;
                if (blob.size > 0) {
                    setFocalPhotoUrl(URL.createObjectURL(blob));
                } else {
                    setFocalPhotoUrl(null);
                }
            } catch (e) {
                setFocalPhotoUrl(null);
            }
        };
        fetchFocalPhoto();
        return () => {
            revoked = true;
            if (focalPhotoUrl && focalPhotoUrl.startsWith('blob:')) {
                try { URL.revokeObjectURL(focalPhotoUrl); } catch (e) { }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, data?.focal?.id, focalId, token]);

    if (!mounted) return null;
    if (loading) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 500 }}>
                Loading community data...
            </div>
        );
    }
    if (error || !data) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 500 }}>
                {error || 'Failed to load community data.'}
            </div>
        );
    }

    function openViewer(url: string) {
        setViewerUrl(url);
        setViewerZoom(1);
        setViewerRotate(0);
        setViewerOpen(true);
    }

    function closeViewer() {
        setViewerOpen(false);
        setViewerUrl(null);
    }

    function toggleZoomOut() {
        setViewerZoom((prev) => Math.max(0.25, prev - 0.25)); // step down, min 0.25
    }

    function resetSize() {
        setViewerZoom(1); // reset to original
    }

    function toggleZoomIn() {
        setViewerZoom((prev) => Math.min(3, prev + 0.25)); // step up, max 3x
    }


    const baseStyle: any = {
        width: 'min(780px, 92%)',
        maxHeight: 'calc(85vh)',
        minHeight: 80,
        overflow: 'auto',
        background: '#0d0d0d',
        color: '#fff',
        borderRadius: 7,
        padding: '62px 75px',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE/Edge
    };

    // Hide scrollbar for Chrome, Safari, Opera
    // Add this style to the modal content container:
    // style={{ ...modalStyle, ...{ '::-webkit-scrollbar': { display: 'none' } } }}
    // But inline styles can't target pseudo-elements, so add a class:
    // <div className="about-modal-content" style={modalStyle}>...</div>
    // And in your CSS file:
    // .about-modal-content::-webkit-scrollbar { display: none; }

    const modalStyle: any = center
        ? { ...baseStyle, position: 'fixed', left: center.x, top: center.y, transform: 'translate(-50%, -50%)', background: '#171717' }
        : { ...baseStyle, position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#171717' };

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
                {/* close X */}
                <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 35, top: 30, background: 'transparent', border: 'none', color: '#BABABA', fontSize: 18, cursor: 'pointer' }}>✕</button>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 27, fontWeight: 800, letterSpacing: 0.6 }}>{data.groupName}</h2>
                        <div style={{ marginTop: 6, color: '#A3A3A3', fontSize: 13, fontWeight: 300 }}>Registered At: {data.registeredAt} <span style={{ fontWeight: 200, opacity: 0.5 }}> &nbsp; | &nbsp; </span> Last Updated At: {data.updatedAt}</div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ marginTop: 25, display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>

                    {/* IDs rows: stacked with divider, label left and value right */}
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                            <div style={{ color: '#fff', fontSize: 15, fontWeight: 400, letterSpacing: 0.6 }}>Terminal ID</div>
                            <div style={{ fontWeight: 200, color: '#fff' }}>{data.terminalId}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                            <div style={{ color: '#fff', fontSize: 15, fontWeight: 400, letterSpacing: 0.6 }}>Terminal Address</div>
                            <div style={{ fontWeight: 200, color: '#fff' }}>{data.address ?? 'N/A'}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                            <div style={{ color: '#fff', fontSize: 15, fontWeight: 400, letterSpacing: 0.6 }}>Coordinates</div>
                            <div style={{ fontWeight: 200, color: '#fff' }}>{data.coordinates ?? 'N/A'}</div>
                        </div>
                    </div>

                    {/* Focal persons header */}
                    <div style={{ marginTop: 19, background: '#fff', color: '#111', padding: '10px 18px', borderRadius: 6, fontSize: 15, fontWeight: 600 }}>Neighborhood Information</div>


                    {/* IDs rows: stacked with divider, label left and value right */}
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                            <div style={{ color: '#fff', fontSize: 15, fontWeight: 400, letterSpacing: 0.6 }}>No. of Households</div>
                            <div style={{ fontWeight: 200, color: '#fff' }}>{
                                data.stats && data.stats.noOfHouseholds !== undefined && data.stats.noOfHouseholds !== null
                                    ? String(data.stats.noOfHouseholds)
                                    : 'N/A'
                            }</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                            <div style={{ color: '#fff', fontSize: 15, fontWeight: 400, letterSpacing: 0.6 }}>No. of Residents</div>
                            <div style={{ fontWeight: 200, color: '#fff' }}>{
                                data.stats && data.stats.noOfResidents !== undefined && data.stats.noOfResidents !== null
                                    ? String(data.stats.noOfResidents)
                                    : 'N/A'
                            }</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                            <div style={{ color: '#fff', fontSize: 15, fontWeight: 400, letterSpacing: 0.6 }}>Floodwater Subsidence Duration</div>
                            ~ &nbsp;{data.floodwaterSubsidenceDuration && data.floodwaterSubsidenceDuration.trim() !== '' ? data.floodwaterSubsidenceDuration : 'N/A'}
                        </div>
                    </div>

                    {/* note */}
                    <div style={{ background: '#262626', padding: '22px 22px', borderRadius: 6, color: '#fff', border: '1px solid #404040', fontSize: 14, fontWeight: 400 }}>
                        <div style={{ fontWeight: 400, fontSize: 15, marginBottom: 10 }}>Flood-related hazards</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 3 }}>
                            {data.hazards.map((hazard: string, idx: number) => (
                                <span key={idx} style={{ display: 'flex', alignItems: 'center', fontWeight: 400, fontSize: 15 }}>
                                    <span style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: '#fff', marginRight: 10, flexShrink: 0 }} />
                                    {hazard}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: '#262626', padding: '22px 22px', borderRadius: 6, color: '#fff', border: '1px solid #404040', fontSize: 14, fontWeight: 400 }}>
                        <div style={{ fontWeight: 400, fontSize: 15, marginBottom: 10 }}>Other notable information</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 3 }}>
                            {data.otherInfo.map((info: string, idx: number) => (
                                <span key={idx} style={{ display: 'flex', alignItems: 'center', fontWeight: 400, fontSize: 15 }}>
                                    <span style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: '#fff', marginRight: 10, flexShrink: 0 }} />
                                    {info}
                                </span>
                            ))}
                        </div>
                    </div>


                    {/* Focal persons profile picture */}
                    <div style={{ marginTop: 19, background: '#fff', color: '#111', padding: '10px 18px', borderRadius: 6, fontSize: 15, fontWeight: 600 }}>Focal Persons</div>


                    {/* Focal person image-only cards (no text) - render only when photo exists */}
                    {focalPhotoUrl ? (
                        <div style={{ background: '#0b0b0b', borderRadius: 6, display: 'flex', justifyContent: 'center', marginTop: 6 }}>
                            <div style={{ width: '100%', maxWidth: '100%', height: 240, borderRadius: 8, overflow: 'hidden', position: 'relative', backgroundColor: '#111' }}>
                                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${focalPhotoUrl})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', filter: 'blur(18px) brightness(0.55)', transform: 'scale(1.2)' }} />
                                <img src={focalPhotoUrl} alt="Focal" style={{ position: 'relative', width: 'auto', height: '100%', maxWidth: '60%', margin: '0 auto', objectFit: 'contain', display: 'block' }} />
                                <button
                                    aria-label="Expand"
                                    onClick={() => openViewer(focalPhotoUrl)}
                                    style={{
                                        position: 'absolute',
                                        right: 15,
                                        bottom: 15,
                                        width: 36,
                                        height: 36,
                                        borderRadius: 4,
                                        background: '#fff',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    <Expand size={15} color="#111" />
                                </button>
                            </div>
                        </div>
                    ) : null}

                </div>

                {/* IDs rows: stacked with divider, label left and value right */}
                <div style={{ overflow: 'hidden', marginTop: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 400, letterSpacing: 0.6 }}>NAME</div>
                        <div style={{ fontWeight: 200, color: '#fff' }}>{data.focal.name}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 400, letterSpacing: 0.6 }}>CONTACT NO.</div>
                        <div style={{ fontWeight: 200, color: '#fff' }}>{data.focal.contact}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 400, letterSpacing: 0.6 }}>EMAIL</div>
                        <div style={{ fontWeight: 200, color: '#fff' }}>{data.focal.email ?? 'N/A'}</div>
                    </div>
                </div>

                {/* altPhoto */}

                {altPhotoUrl ? (
                    <div style={{ background: '#0b0b0b', borderRadius: 6, display: 'flex', justifyContent: 'center', marginTop: 25 }}>
                        <div style={{ width: '100%', maxWidth: '100%', height: 240, borderRadius: 8, overflow: 'hidden', position: 'relative', backgroundColor: '#111' }}>
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${altPhotoUrl})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', filter: 'blur(18px) brightness(0.55)', transform: 'scale(1.2)' }} />
                            <img src={altPhotoUrl} alt="Alt Focal" style={{ position: 'relative', width: 'auto', height: '100%', maxWidth: '60%', margin: '0 auto', objectFit: 'contain', display: 'block' }} />
                            <button
                                aria-label="Expand"
                                onClick={() => openViewer(altPhotoUrl)}
                                style={{
                                    position: 'absolute',
                                    right: 15,
                                    bottom: 15,
                                    width: 36,
                                    height: 36,
                                    borderRadius: 4,
                                    background: '#fff',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                                }}
                            >
                                <Expand size={15} color="#111" />
                            </button>
                        </div>
                    </div>
                ) : null}

                {/* IDs rows: stacked with divider, label left and value right */}
                <div style={{ overflow: 'hidden', marginTop: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 400, letterSpacing: 0.6 }}>ALTERNATIVE FOCAL PERSON</div>
                        <div style={{ fontWeight: 200, color: '#fff' }}>{data.altFocal?.name ?? 'N/A'}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 400, letterSpacing: 0.6 }}>CONTACT NO.</div>
                        <div style={{ fontWeight: 200, color: '#fff' }}>{data.altFocal?.contact ?? 'N/A'}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 400, letterSpacing: 0.6 }}>EMAIL</div>
                        <div style={{ fontWeight: 200, color: '#fff' }}>{data.altFocal?.email ?? 'N/A'}</div>
                    </div>
                </div>

                {/* primary action button (bottom) */}
                <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={() => onEdit && onEdit()}
                        className={`
                            w-full max-w-[660px] 
                            bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] 
                            text-white 
                            py-3 px-4.5 
                            rounded-md 
                            font-medium text-[15px] tracking-[0.6px] 
                            border-0 
                            transition-colors duration-150
                            hover:from-[#2563eb] hover:to-[#60a5fa] 
                            ${onEdit ? 'cursor-pointer' : 'cursor-default'}
                        `}

                    >
                        EDIT INFORMATION
                    </button>
                </div>

            </div>
            {viewerOpen && viewerUrl && (
                <div onClick={closeViewer} style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', zIndex: 'calc(var(--z-popover) + 10)' }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: 'min(98vw,600px)', maxHeight: '65vh', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={viewerUrl} alt="viewer" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${viewerZoom}) rotate(${viewerRotate}deg)`, maxWidth: '100%', maxHeight: '100%' }} />
                    </div>

                    {/* buttons pinned to bottom of viewport */}
                    <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', left: '50%', bottom: 40, transform: 'translateX(-50%)', display: 'flex' }}>
                        <button onClick={toggleZoomOut} style={{ background: '#fff', borderRight: '1px solid #e0e0e0', width: 50, height: 50, borderRadius: '4px 0 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Zoom Out"><Minus size={18} /></button>
                        <button onClick={resetSize} style={{ background: '#fff', border: 'none', width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Reset"><ZoomOut size={18} /></button>
                        <button onClick={toggleZoomIn} style={{ background: '#fff', borderLeft: '1px solid #e0e0e0', width: 50, height: 50, borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Zoom In"><Plus size={18} /></button>
                    </div>
                </div>
            )}



        </div>
    );
}
