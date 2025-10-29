import { useLiveReport } from '@/components/Official/LiveReportContext';
import { useRescueForm } from '@/components/Official/RescueFormContext';
import { X } from 'lucide-react';
import { useRescueWaitlist } from '../contexts/RescueWaitlistContext';
import type { SignalPopupProps } from '../types/popup';
import RescueFormSheet from './RescueFormSheet';

const styles = {
    popoverRow: "flex flex-row gap-3",
    popoverLabel: "w-[180px] text-sm font-medium",
    popoverValue: "ml-auto text-right text-sm max-w-[170px] whitespace-normal break-words",
    popoverValueWide: "flex-1 text-right text-sm leading-tight max-w-[220px] whitespace-normal break-words",
    popoverContainer: "flex flex-col gap-2 mb-4",
} as const;

const PopoverRow = ({ label, value, isWide = false }: { label: string; value: React.ReactNode; isWide?: boolean }) => (
    <div className={styles.popoverRow}>
        <div className={styles.popoverLabel}>{label}</div>
        <div className={isWide ? styles.popoverValueWide : styles.popoverValue}>
            {value}
        </div>
    </div>
);

export default function SignalPopover({ 
    popover, 
    setPopover, 
    onClose, 
    onOpenCommunityInfo, 
    onDispatchRescue, 
    onRemoveSignal, 
    onShowWaitlistAlert,
    onShowDispatchAlert,
    onShowErrorAlert,
    onShowDispatchConfirmation
}: SignalPopupProps) {
    const { isRescueFormOpen, setIsRescueFormOpen } = useRescueForm();
    const { setIsLiveReportOpen } = useLiveReport();
    const { addToWaitlist } = useRescueWaitlist();
    
    const handleWaitlist = (formData: any) => {
        if (!popover) return;
        
        const waitlistData = {
            ...formData,
            alertId: popover.alertId, // Include alertId for backend operations and map updates
            deviceId: popover.deviceId,
            address: popover.address,
            date: popover.date,
            alertType: (popover.alertType as 'CRITICAL' | 'USER-INITIATED') || 'USER-INITIATED'
        };
        
        addToWaitlist(waitlistData);
        setIsLiveReportOpen(true);
        setIsRescueFormOpen(false);
        // Close the popover after adding to waitlist
        setPopover(null);
        
        // Show success alert
        onShowWaitlistAlert?.(popover.focalPerson || 'Unknown');
    };

    const handleDispatch = (formData?: any) => {
        if (!popover || !popover.alertId) {
            console.error('[SignalPopover] Cannot dispatch: missing alertId');
            onShowErrorAlert?.('Cannot dispatch: missing alert information');
            return;
        }
        
        // Show confirmation dialog
        if (formData) {
            onShowDispatchConfirmation?.(formData, () => {
                // Remove the signal from the map
                if (onRemoveSignal && popover.alertId) {
                    onRemoveSignal(popover.alertId);
                }
                
                setIsRescueFormOpen(false);
                setPopover(null); // Close the popover
                onDispatchRescue?.(); // Show dispatch confirmation dialog
                
                // Show success alert
                onShowDispatchAlert?.(popover.focalPerson || 'Unknown');
            });
        } else {
            // Direct dispatch without confirmation
            if (onRemoveSignal && popover.alertId) {
                onRemoveSignal(popover.alertId);
            }
            
            setIsRescueFormOpen(false);
            setPopover(null);
            onDispatchRescue?.();
            
            onShowDispatchAlert?.(popover.focalPerson || 'Unknown');
        }
    };
    
    if (!popover) return null;

    const popoverWidth = 390;
    const popoverHeight = 320;
    const offsetX = popoverWidth / 1.390;
    const offsetY = popoverHeight + 150;

    return (
        <>
            <div id="signal-popover-wrapper" style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${(popover.screen.x - offsetX)}px, ${(popover.screen.y - offsetY)}px)`, zIndex: 'var(--z-map-popover)', pointerEvents: 'none' }}>
                <div style={{ position: 'relative', minWidth: 370, maxWidth: 420 }}>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.80)', color: '#fff', boxShadow: '0 8px 28px rgba(0,0,0,0.45)', padding: '20px 18px 20px 18px', fontFamily: 'inherit', borderRadius: 5 }}>
                        {/* Header with close button */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="font-bold uppercase text-base">ALERT DETAILS</div>
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
                                value={popover.deviceId || 'N/A'} 
                            />
                            <PopoverRow 
                                label="Alert Type" 
                                value={
                                    popover.alertType === 'CRITICAL' ? 'Critical' :
                                    popover.alertType === 'USER-INITIATED' ? 'User-Initiated' :
                                    popover.alertType === 'ONLINE' ? 'No Alert' :
                                    popover.alertType === 'OFFLINE' ? 'No Alert' :
                                    'N/A'
                                } 
                            />
                            <PopoverRow 
                                label="Terminal Status" 
                                value={
                                    popover.status === 'ONLINE' ? 'Online' :
                                    popover.status === 'OFFLINE' ? 'Offline' :
                                    popover.status || 'N/A'
                                } 
                            />
                            <PopoverRow 
                                label="Time Sent" 
                                value={popover.timeSent || 'N/A'} 
                            />
                            <PopoverRow 
                                label="Focal Person" 
                                value={popover.focalPerson || 'N/A'} 
                            />
                            <PopoverRow 
                                label="House Address" 
                                value={popover.address || 'N/A'} 
                            />
                            <PopoverRow 
                                label="Contact Number" 
                                value={popover.contactNumber || 'N/A'} 
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
                            <button
                                onClick={() => {
                                    setIsRescueFormOpen(true);
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                            >
                                Rescue Form
                            </button>
                        </div>

                        {/* Downward pointer/arrow */}
                        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '-23px', width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: '24px solid rgba(0,0,0,0.80)' }} />
                    </div>
                </div>
            </div>

            {/* Rescue Form Sheet - Rendered separately at root level */}
            <RescueFormSheet 
                isOpen={isRescueFormOpen}
                onClose={() => setIsRescueFormOpen(false)}
                focalPerson={popover.focalPerson || 'N/A'}
                alertId={popover.alertId}
                onWaitlist={handleWaitlist}
                onDispatch={handleDispatch}
            />
        </>
    );
}