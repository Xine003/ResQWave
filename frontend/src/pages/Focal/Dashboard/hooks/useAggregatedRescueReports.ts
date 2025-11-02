import { useEffect, useState } from 'react';
import { apiFetch } from '../../../Official/Reports/api/api';

export interface RescueReport {
    id?: string | number;
    emergencyId?: string;
    alertId?: string;
    alertType?: string;
    prfCompletedAt?: string;
    timeOfRescue?: string;
    rescueCompleted?: boolean;
    neighborhoodId?: string;
    focalPersonName?: string;
    focalPersonAddress?: string;
    focalPersonContactNumber?: string;
    waterLevel?: string;
    urgencyOfEvacuation?: string;
    hazardPresent?: string;
    accessibility?: string;
    resourceNeeds?: string;
    otherInformation?: string;
    rescueCompletionTime?: string;
    noOfPersonnel?: number;
    resourcesUsed?: string;
    actionsTaken?: string;
    [key: string]: unknown;
}

export function useAggregatedRescueReports() {
    const [reports, setReports] = useState<RescueReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        apiFetch<RescueReport[]>('/post/aggregated')
            .then((data) => setReports(data))
            .catch((err) => setError(err.message || 'Failed to fetch reports'))
            .finally(() => setLoading(false));
    }, []);

    return { reports, loading, error };
}
