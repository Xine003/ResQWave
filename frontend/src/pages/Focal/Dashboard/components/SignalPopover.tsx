import type { SignalPopupProps } from '../types/popup';
import { X } from 'lucide-react';

// Reusable style constants
const styles = {
    popoverRow: "flex flex-row gap-3",
    popoverLabel: "w-[180px] text-sm font-medium",
    popoverValue: "ml-auto text-right text-sm max-w-[170px] whitespace-normal break-words",
    popoverValueWide: "flex-1 text-right text-sm leading-tight max-w-[220px] whitespace-normal break-words",
    popoverContainer: "flex flex-col gap-2 mb-4",
    popoverTitle: "font-bold uppercase text-base mb-4"
};

// Reusable PopoverRow component
const PopoverRow = ({ label, value, isWide = false }: { label: string; value: React.ReactNode; isWide?: boolean }) => (
    <div className={styles.popoverRow}>
        <div className={styles.popoverLabel}>{label}</div>
        <div className={isWide ? styles.popoverValueWide : styles.popoverValue}>
            {value}
        </div>
    </div>
);

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
    const offsetY = popover?.status === 'online' ? 345 : 185;

    return (
        <div id="signal-popover-wrapper" style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${(popover.screen.x - 200)}px, ${(popover.screen.y - offsetY)}px)`, zIndex: 'var(--z-map-popover)', pointerEvents: 'none' }}>
            <div style={{ position: 'relative', minWidth: 370, maxWidth: 420 }}>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.80)', color: '#fff', boxShadow: '0 8px 28px rgba(0,0,0,0.45)', padding: '20px 18px 20px 18px', fontFamily: 'inherit', borderRadius: 5 }}>
                    {/* Header with title and close button aligned horizontally */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="font-bold uppercase text-base">{popover?.title || 'PAMAKAI'}</div>
                        <button
                            onClick={() => {
                                setPopover(null);
                                onClose?.();
                            }}
                            className="text-gray-400 hover:text-white hover:cursor-pointer pointer-events-auto transition-colors p-1"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Rows (label/value) - full details when online, minimal (name/address/date) for gray/offline signals */}
                    {popover?.status === 'online' ? (
                        <div className={styles.popoverContainer}>
                            <PopoverRow 
                                label="Terminal ID" 
                                value={popover.deviceId || 'RSQW-001'} 
                            />
                            <PopoverRow 
                                label="Focal Person" 
                                value={popover.focalPerson || (popover.title || 'Gwyneth Uy')} 
                            />
                            <PopoverRow 
                                label="Alternative Focal Person" 
                                value={popover.altFocalPerson || 'Rodel Sustiguer'} 
                            />
                            <PopoverRow 
                                label="Terminal Address" 
                                value={popover.address || 'Block 1, Lot 17, Paraiso Rd, 1400'} 
                            />
                            
                            {/* Coordinates row (stacked values on right) */}
                            <PopoverRow 
                                label="Coordinates" 
                                isWide={true}
                                value={
                                    popover.lat?.toFixed?.(6) && popover.lng?.toFixed?.(6) ? (
                                        <>
                                            <div>{popover.lat.toFixed(6)}</div>
                                            <div>{popover.lng.toFixed(6)}</div>
                                        </>
                                    ) : (
                                        <div>{popover.coordinates || '—'}</div>
                                    )
                                }
                            />
                            
                            <PopoverRow 
                                label="Date Registered" 
                                value={popover.date || 'September 9, 2025'} 
                            />
                        </div>
                    ) : (
                        <div className={styles.popoverContainer}>
                            <PopoverRow 
                                label="Address" 
                                value={popover.address || '—'} 
                            />
                            <PopoverRow 
                                label="Date Registered" 
                                value={popover.date || '—'} 
                            />
                        </div>
                    )}

                    {/* Action button - only show for the green (online) community signal */}
                    {/* {popover?.status === 'online' ? (
                        <div className="block">
                            <button
                                onClick={() => {
                                    setPopover(null);
                                    onClose?.();
                                    setEditBoundaryOpen(true);
                                }}
                                className="pointer-events-auto w-full text-center text-white font-normal text-[13px] 
                                    px-3.5 py-3 rounded-lg cursor-pointer 
                                    bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] 
                                    border-0
                                    transition-colors duration-150
                                    hover:from-[#2563eb] hover:to-[#60a5fa]"
                            >
                                EDIT MY COMMUNITY MARKERS
                            </button>
                        </div>

                    ) : null} */}

                    {/* Downward pointer/arrow */}
                    <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '-23px', width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: '24px solid rgba(0,0,0,0.80)' }} />
                </div>
            </div>
        </div>
    );
}
