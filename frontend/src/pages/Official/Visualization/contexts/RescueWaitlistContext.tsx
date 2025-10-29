import React, { createContext, useContext, useState } from 'react';

interface RescueFormData {
    focalPerson: string;
    focalUnreachable: boolean;
    waterLevel: string;
    waterLevelDetails: string;
    urgencyLevel: string;
    urgencyDetails: string;
    hazards: string[];
    hazardDetails: string;
    accessibility: string;
    accessibilityDetails: string;
    resources: string[];
    resourceDetails: string;
    otherInfo: string;
    // Additional fields for waitlist display and backend operations
    alertId?: string; // Required for backend operations and map updates
    deviceId?: string;
    address?: string;
    date?: string;
    alertType?: 'CRITICAL' | 'USER-INITIATED';
}

interface WaitlistedRescueForm extends RescueFormData {
    id: string;
    timestamp: string;
    status: 'WAITLISTED';
}

interface RescueWaitlistContextType {
    waitlistedForms: WaitlistedRescueForm[];
    addToWaitlist: (formData: RescueFormData) => void;
    removeFromWaitlist: (id: string) => void;
    selectedWaitlistForm: WaitlistedRescueForm | null;
    setSelectedWaitlistForm: (form: WaitlistedRescueForm | null) => void;
}

const RescueWaitlistContext = createContext<RescueWaitlistContextType | undefined>(undefined);

export function RescueWaitlistProvider({ children }: { children: React.ReactNode }) {
    const [waitlistedForms, setWaitlistedForms] = useState<WaitlistedRescueForm[]>([]);
    const [selectedWaitlistForm, setSelectedWaitlistForm] = useState<WaitlistedRescueForm | null>(null);

    const addToWaitlist = (formData: RescueFormData) => {
        const waitlistedForm: WaitlistedRescueForm = {
            ...formData,
            id: `rescue-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'WAITLISTED'
        };
        setWaitlistedForms(prev => [...prev, waitlistedForm]);
    };

    const removeFromWaitlist = (id: string) => {
        setWaitlistedForms(prev => prev.filter(form => form.id !== id));
    };

    return (
        <RescueWaitlistContext.Provider value={{
            waitlistedForms,
            addToWaitlist,
            removeFromWaitlist,
            selectedWaitlistForm,
            setSelectedWaitlistForm
        }}>
            {children}
        </RescueWaitlistContext.Provider>
    );
}

export function useRescueWaitlist() {
    const context = useContext(RescueWaitlistContext);
    if (!context) {
        throw new Error('useRescueWaitlist must be used within a RescueWaitlistProvider');
    }
    return context;
}

export type { RescueFormData, WaitlistedRescueForm };
