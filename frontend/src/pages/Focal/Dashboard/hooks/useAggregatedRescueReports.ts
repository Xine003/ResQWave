import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export function useAggregatedRescueReports() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        apiFetch('/post/aggregated')
            .then((data) => setReports(data))
            .catch((err) => setError(err.message || 'Failed to fetch reports'))
            .finally(() => setLoading(false));
    }, []);

    return { reports, loading, error };
}
