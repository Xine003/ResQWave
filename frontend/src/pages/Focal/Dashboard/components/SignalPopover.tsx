import type { SignalPopupProps } from '../types/popup';

export default function SignalPopup({ popover, setPopover, setEditBoundaryOpen, onClose, infoBubble, infoBubbleVisible }: SignalPopupProps) {
    // Render the info bubble when there is no popover open
    if (!popover && infoBubble && infoBubbleVisible) {
        return (
            <div style={{ position: 'absolute', left: infoBubble.x, top: 100 + infoBubble.y, transform: 'translate(-50%, 12px)', zIndex: 35, pointerEvents: 'none' }}>
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ background: '#ffffff', color: '#000', padding: '8px 12px', borderRadius: 999, boxShadow: '0 8px 20px rgba(2,6,23,0.18)', fontSize: 10.3, fontWeight: 500, textTransform: 'uppercase', whiteSpace: 'nowrap', border: '2px solid #22c55e' }}>YOUR COMMUNITY</div>
                    {/* outer green triangle (border) positioned above the bubble */}
                    <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%) rotate(180deg)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid #22c55e', marginBottom: -1 }} />
                </div>
            </div>
        );
    }

    if (!popover) return null;

    // For offline/gray popovers we want the box to sit closer above the signal dot
    const offsetY = popover?.status === 'online' ? 375 : 185;

    return (
        <div id="signal-popover-wrapper" style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${(popover.screen.x - 200)}px, ${(popover.screen.y - offsetY)}px)`, zIndex: 'var(--z-map-popover)', pointerEvents: 'none' }}>
            <div style={{ position: 'relative', minWidth: 370, maxWidth: 420 }}>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.88)', color: '#fff', boxShadow: '0 8px 28px rgba(0,0,0,0.45)', padding: '18px 18px 12px 18px', fontFamily: 'inherit', borderRadius: 6 }}>
                    {/* Close button top right */}
                    <button
                        onClick={() => {
                            setPopover(null);
                            onClose?.();
                        }}
                        style={{ position: 'absolute', top: 10, right: 14, background: 'none', border: 'none', color: '#fff', fontSize: 26, cursor: 'pointer', zIndex: 2, pointerEvents: 'auto' }}
                        aria-label="Close"
                    >
                        &times;
                    </button>

                    {/* Title */}
                    <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: 0.6, marginBottom: 16 }}>{popover?.title || 'PAMAKAI'}</div>

                    {/* Rows (label/value) - full details when online, minimal (name/address/date) for gray/offline signals */}
                    {popover?.status === 'online' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                                <div style={{ width: 180, fontSize: 14, fontWeight: 600 }}>Device ID</div>
                                <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 14, maxWidth: 170, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{popover.deviceId || 'RSQW-001'}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                                <div style={{ width: 180, fontSize: 14, fontWeight: 600 }}>Focal Person</div>
                                <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 14, maxWidth: 170, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{popover.focalPerson || (popover.title || 'Gwyneth Uy')}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                                <div style={{ width: 180, fontSize: 14, fontWeight: 600 }}>Alternative Focal Person</div>
                                <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 14, maxWidth: 170, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{popover.altFocalPerson || 'Rodel Sustiguer'}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                                <div style={{ width: 180, fontSize: 14, fontWeight: 600 }}>Terminal Address</div>
                                <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 14, maxWidth: 170, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{popover.address || 'Block 1, Lot 17, Paraiso Rd, 1400'}</div>
                            </div>

                            {/* Coordinates row (stacked values on right) */}
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                                <div style={{ width: 180, fontSize: 14, fontWeight: 600 }}>Coordinates</div>
                                <div style={{ flex: 1, textAlign: 'right', fontSize: 14, lineHeight: 1.2, maxWidth: 220, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                    {popover.lat?.toFixed?.(6) && popover.lng?.toFixed?.(6) ? (
                                        <>
                                            <div>{popover.lat.toFixed(6)}</div>
                                            <div>{popover.lng.toFixed(6)}</div>
                                        </>
                                    ) : (
                                        <div>{popover.coordinates || '—'}</div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                                <div style={{ width: 180, fontSize: 14, fontWeight: 600 }}>Date Registered</div>
                                <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 14, maxWidth: 170, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{popover.date || 'September 9, 2025'}</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                                <div style={{ width: 180, fontSize: 14, fontWeight: 600 }}>Address</div>
                                <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 14, maxWidth: 170, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{popover.address || '—'}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                                <div style={{ width: 180, fontSize: 14, fontWeight: 600 }}>Date Registered</div>
                                <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 14, maxWidth: 170, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{popover.date || '—'}</div>
                            </div>
                        </div>
                    )}

                    {/* Action button - only show for the green (online) community signal */}
                    {popover?.status === 'online' ? (
                        <div className="block mt-4">
                            <button
                                onClick={() => {
                                    setPopover(null);
                                    onClose?.();
                                    setEditBoundaryOpen(true);
                                }}
                                className="pointer-events-auto w-full text-center text-white font-normal text-[13px] 
                                    px-3.5 py-3 rounded-lg cursor-pointer 
                                    bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] 
                                    shadow-[0_6px_12px_rgba(37,99,235,0.28)] 
                                    border-0
                                    transition-colors duration-150
                                    hover:from-[#2563eb] hover:to-[#60a5fa] hover:shadow-[0_8px_16px_rgba(37,99,235,0.38)]"
                            >
                                EDIT MY COMMUNITY MARKERS
                            </button>
                        </div>

                    ) : null}

                    {/* Downward pointer/arrow */}
                    <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '-24px', width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: '24px solid rgba(0,0,0,0.88)' }} />
                </div>
            </div>
        </div>
    );
}
