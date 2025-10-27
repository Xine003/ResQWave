import { useState } from 'react';
import type { InfoBubble, Signal, SignalPopover } from '../types/signals';
import { useMapAlerts } from './useMapAlerts';

export default function useSignals() {
    const { signals: mapSignals, isLoading, error } = useMapAlerts();
    
    const [popover, setPopover] = useState<SignalPopover | null>(null);
    const [infoBubble, setInfoBubble] = useState<InfoBubble | null>(null);
    const [infoBubbleVisible, setInfoBubbleVisible] = useState(true);
    
    // Transform backend MapSignal[] to frontend Signal[] format
    const transformedSignals: Signal[] = mapSignals.map(signal => {
        const alertType = determineAlertType(signal);
        
        return {
            coordinates: signal.coordinates || [0, 0],
            properties: {
                status: signal.terminalStatus.toUpperCase() as 'ONLINE' | 'OFFLINE',
                deviceId: signal.deviceId,
                focalPerson: signal.focalPerson,
                address: signal.address,
                name: signal.deviceName,
                alertType: alertType as 'CRITICAL' | 'USER-INITIATED' | 'ONLINE' | 'OFFLINE',
                contactNumber: signal.contactNumber,
                timeSent: signal.timeSent
            },
            boundary: []
        };
    });
    
    const getDistressCoord = (): [number, number] => {
        return transformedSignals[0]?.coordinates as [number, number] || [121.04040046802031, 14.7721611560019];
    };

    return {
        otherSignals: transformedSignals,
        ownCommunitySignal: transformedSignals[0] || null,
        popover,
        setPopover,
        infoBubble,
        setInfoBubble,
        infoBubbleVisible,
        setInfoBubbleVisible,
        getDistressCoord,
        isLoading,
        error
    } as const;
}

/**
 * Determines the alert type based on signal data
 * Returns terminal status if no alert exists
 */
function determineAlertType(signal: any): string {
    if (!signal.alertType || signal.alertType === 'null' || signal.alertType === '') {
        return signal.terminalStatus.toUpperCase();
    }
    
    if (signal.alertType === 'User-Initiated') {
        return 'USER-INITIATED';
    }
    
    if (signal.alertType === 'Critical') {
        return 'CRITICAL';
    }
    
    return signal.terminalStatus.toUpperCase();
}