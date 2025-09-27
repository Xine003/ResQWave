import { useState } from 'react';
import { Expand, Minus, Plus, ZoomOut } from 'lucide-react';
import useCommunityData from '../hooks/useCommunityData';

type AboutModalProps = {
    open: boolean;
    onClose: () => void;
    onEdit?: () => void;
    // optional viewport center to position the modal over the map
    center?: { x: number; y: number } | null;
};

export default function AboutModal({ open, onClose, onEdit, center = null }: AboutModalProps) {
    if (!open) return null;

    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);
    const [viewerZoom, setViewerZoom] = useState(1);
    const [viewerRotate, setViewerRotate] = useState(0);

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

    function toggleZoom() {
        setViewerZoom((z) => (z === 1 ? 1.5 : 1));
    }

    function rotateOnce() {
        setViewerRotate((r) => (r + 90) % 360);
    }

    function downloadImage() {
        if (!viewerUrl) return;
        const a = document.createElement('a');
        a.href = viewerUrl;
        a.download = 'image.jpg';
        document.body.appendChild(a);
        a.click();
        a.remove();
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

    const { data } = useCommunityData();
    const statsTop = [String(data.stats.individuals), String(data.stats.families), String(data.stats.kids)];
    const statsTopLabels = ['Individuals', 'Families', 'Kids'];

    const statsBottom = [String(data.stats.seniors), String(data.stats.pwds), String(data.stats.pregnant)];
    const statsBottomLabels = ['Seniors', 'PWDs', 'Pregnant Women'];

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 'var(--z-popover)' }}>
            <div style={modalStyle}>
                {/* close X */}
                <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 35, top: 30, background: 'transparent', border: 'none', color: '#BABABA', fontSize: 18, cursor: 'pointer' }}>✕</button>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 27, fontWeight: 800, letterSpacing: 0.6 }}>{data.groupName}</h2>
                        <div style={{ marginTop: 6, color: '#fff', fontSize: 13, fontWeight: 300 }}>Registered At: {data.registeredAt} <span style={{ fontWeight: 200, opacity: 0.5 }}> &nbsp; | &nbsp; </span> Last Updated At: {data.updatedAt}</div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                    {/* white input-like header */}
                    <div style={{ background: '#fff', color: '#111', padding: '10px 17px', borderRadius: 4, fontWeight: 600, fontSize: 15 }}>Community Information</div>

                    {/* IDs rows: stacked with divider, label left and value right */}
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                            <div style={{ color: '#fff', fontSize: 14, fontWeight: 400, letterSpacing: 0.6 }}>TERMINAL ID</div>
                            <div style={{ fontWeight: 200, color: '#fff' }}>{data.terminalId}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                            <div style={{ color: '#fff', fontSize: 14, fontWeight: 400, letterSpacing: 0.6 }}>COMMUNITY ID</div>
                            <div style={{ fontWeight: 200, color: '#fff' }}>{data.communityId}</div>
                        </div>
                    </div>

                    {/* stats pills */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {statsTop.map((count, i) => (
                            <div
                                key={`${count}-${i}`}
                                style={{
                                    background: '#262626',
                                    padding: '19px 14px',
                                    borderRadius: 6,
                                    color: '#fff',
                                    fontSize: 13,
                                    textAlign: 'center',
                                    border: '1px solid #404040',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 5,
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1 }}>{count}</div>
                                <div style={{ opacity: 0.9, fontSize: 14, lineHeight: 1, marginLeft: 0 }}>{statsTopLabels[i]}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: -5 }}>
                        {statsBottom.map((count, i) => (
                            <div
                                key={`${count}-${i}`}
                                style={{
                                    background: '#262626',
                                    padding: '19px 14px',
                                    borderRadius: 6,
                                    color: '#fff',
                                    fontSize: 13,
                                    textAlign: 'center',
                                    border: '1px solid #404040',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 5,
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1 }}>{count}</div>
                                <div style={{ opacity: 0.9, fontSize: 14, lineHeight: 1, marginLeft: 0 }}>{statsBottomLabels[i]}</div>
                            </div>
                        ))}
                    </div>

                    {/* note */}
                    <div style={{ background: '#262626', padding: '15px 21px', borderRadius: 6, color: '#fff', border: '1px solid #404040', fontSize: 14, fontWeight: 400 }}>• <span>&nbsp;</span>{data.note}</div>

                    {/* Focal persons header */}
                    <div style={{ marginTop: 10, background: '#fff', color: '#111', padding: '10px 18px', borderRadius: 6, fontWeight: 600 }}>Focal Persons</div>

                    {/* Focal person image-only cards (no text) */}
                    <div style={{ background: '#0b0b0b', borderRadius: 6, display: 'flex', justifyContent: 'center', marginTop: 6 }}>
                        <div style={{ width: '100%', maxWidth: '100%', height: 240, borderRadius: 8, overflow: 'hidden', position: 'relative', backgroundColor: '#111' }}>
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${data.focal.photo})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', filter: 'blur(18px) brightness(0.55)', transform: 'scale(1.2)' }} />
                            <img src={data.focal.photo || ''} alt="Focal" style={{ position: 'relative', width: 'auto', height: '100%', maxWidth: '60%', margin: '0 auto', objectFit: 'contain', display: 'block' }} />
                            <button
                                aria-label="Expand"
                                onClick={() => openViewer('https://avatars.githubusercontent.com/u/1?v=4')}
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
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 400, letterSpacing: 0.6 }}>HOUSE ADDRESS</div>
                        <div style={{ fontWeight: 200, color: '#fff' }}>{data.focal.address}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 400, letterSpacing: 0.6 }}>COORDINATES</div>
                        <div style={{ fontWeight: 200, color: '#fff' }}>{data.focal.coordinates}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 400, letterSpacing: 0.6 }}>ALTERNATIVE FOCAL PERSON</div>
                        <div style={{ fontWeight: 200, color: '#fff' }}>{data.focal.altFocal}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 400, letterSpacing: 0.6 }}>CONTACT NO.</div>
                        <div style={{ fontWeight: 200, color: '#fff' }}>{data.communityId}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 400, letterSpacing: 0.6 }}>TERMINAL ID</div>
                        <div style={{ fontWeight: 200, color: '#fff' }}>{data.terminalId}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 17px', borderBottom: '1px solid rgba(64,64,64)' }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 400, letterSpacing: 0.6 }}>COMMUNITY ID</div>
                        <div style={{ fontWeight: 200, color: '#fff' }}>0905 563 2034</div>
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
                    <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: 'min(98vw, 900px)', maxHeight: '65vh', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={viewerUrl}
                            alt="viewer"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                transform: `scale(${viewerZoom}) rotate(${viewerRotate}deg)`,
                                maxWidth: '100%',
                                maxHeight: '100%',
                            }}
                        />
                    </div>
                    {/* tool buttons bottom-center */}
                    <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 70, display: 'flex' }}>
                        <button onClick={toggleZoom} style={{ background: '#fff', borderRight: '1px solid #e0e0e0', width: 50, height: 50, borderRadius: '4px 0 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Zoom"><Minus size={18} /></button>
                        <button onClick={rotateOnce} style={{ background: '#fff', border: 'none', width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Rotate"><ZoomOut size={18} /></button>
                        <button onClick={downloadImage} style={{ background: '#fff', borderLeft: '1px solid #e0e0e0', width: 50, height: 50, borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Download"><Plus size={18} /></button>
                    </div>
                </div>
            )}

        </div>
    );
}
