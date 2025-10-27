import { useCallback, useEffect, useState } from 'react';
import { fetchAllMapAlerts, type MapSignal } from '../api/mapAlerts';

interface UseMapAlertsReturn {
    signals: MapSignal[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage map alerts
 * Polls every 30 seconds for real-time updates
 */
export function useMapAlerts(): UseMapAlertsReturn {
    const [signals, setSignals] = useState<MapSignal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchSignals = useCallback(async () => {
        try {
            setError(null);
            const data = await fetchAllMapAlerts();
            setSignals(data);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchSignals();
    }, [fetchSignals]);

    // Poll every 30 seconds
    useEffect(() => {
        const interval = setInterval(fetchSignals, 30000);
        return () => clearInterval(interval);
    }, [fetchSignals]);

    return {
        signals,
        isLoading,
        error,
        refetch: fetchSignals
    };
}
