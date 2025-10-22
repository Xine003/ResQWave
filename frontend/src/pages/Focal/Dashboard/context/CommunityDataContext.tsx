import React, { createContext, useContext } from 'react';
import useCommunityDataRaw from '../hooks/useCommunityData';

const CommunityDataContext = createContext<any>(null);

export function CommunityDataProvider({ children }: { children: React.ReactNode }) {
    const { data, loading, error, refetch } = useCommunityDataRaw();
    // Optionally, you can keep local state here if you want to force updates
    return (
        <CommunityDataContext.Provider value={{ data, loading, error, refetch }}>
            {children}
        </CommunityDataContext.Provider>
    );
}

export function useCommunityDataContext() {
    const ctx = useContext(CommunityDataContext);
    if (!ctx) throw new Error('useCommunityDataContext must be used within CommunityDataProvider');
    return ctx;
}
