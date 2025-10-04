import { X } from 'lucide-react';
import type { SignalPopupProps } from '../types/popup';

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

export default function SignalPopover({ popover, setPopover, onClose, onOpenCommunityInfo, infoBubble, infoBubbleVisible }: SignalPopupProps) {
    if (!popover) return null;

    // Calculate precise positioning to align popover with pin
    // The popover should appear above the pin with the arrow pointing down to it
    const popoverWidth = 390; // approximate popover width
    const popoverHeight = 320; // fixed height for consistent positioning
    
    // Position the popover above the pin, centered horizontally
    const offsetX = popoverWidth / 1.390; // center the popover horizontally on the pin
    const offsetY = popoverHeight + 135; // position above the pin with some margin

    // Check if rescue form button should be shown (not for ONLINE or OFFLINE status)
    const showRescueForm = true; // Always show rescue form button

    return (
        <div id="signal-popover-wrapper" style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${(popover.screen.x - offsetX)}px, ${(popover.screen.y - offsetY)}px)`, zIndex: 'var(--z-map-popover)', pointerEvents: 'none' }}>
            <div style={{ position: 'relative', minWidth: 370, maxWidth: 420 }}>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.80)', color: '#fff', boxShadow: '0 8px 28px rgba(0,0,0,0.45)', padding: '20px 18px 20px 18px', fontFamily: 'inherit', borderRadius: 5 }}>
                    {/* Header with community name and close button */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="font-bold uppercase text-base">{popover?.title || 'COMMUNITY NAME'}</div>
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

                    {/* Information rows */}
                    <div className={styles.popoverContainer}>
                        <PopoverRow 
                            label="Device ID" 
                            value={popover.deviceId || 'RSQW-001'} 
                        />
                        <PopoverRow 
                            label="Alert Type" 
                            value={popover.alertType || 'Emergency Alert'} 
                        />
                        <PopoverRow 
                            label="Status" 
                            value={popover.status || 'Active'} 
                        />
                        <PopoverRow 
                            label="Time Sent" 
                            value={popover.timeSent || '2:30 PM'} 
                        />
                        <PopoverRow 
                            label="Focal Person" 
                            value={popover.focalPerson || 'Gwyneth Uy'} 
                        />
                        <PopoverRow 
                            label="House Address" 
                            value={popover.address || 'Block 1, Lot 17, Paraiso Rd, 1400'} 
                        />
                        <PopoverRow 
                            label="Contact Number" 
                            value={popover.contactNumber || '+63 912 345 6789'} 
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pointer-events-auto">
                        <button
                            onClick={() => {
                                onOpenCommunityInfo?.();
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                        >
                            More Info
                        </button>
                        {showRescueForm && (
                            <button
                                onClick={() => {
                                    // TODO: Implement Rescue Form Sidebar
                                    console.log('Rescue Form button clicked');
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                            >
                                Rescue Form
                            </button>
                        )}
                    </div>

                    {/* Downward pointer/arrow */}
                    <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '-23px', width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: '24px solid rgba(0,0,0,0.80)' }} />
                </div>
            </div>
        </div>
    );
}