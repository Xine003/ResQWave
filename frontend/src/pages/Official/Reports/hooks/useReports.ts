import { fetchCompletedReports as apiFetchCompletedReports, fetchPendingReports as apiFetchPendingReports, clearReportsCache, type CompletedReport, type PendingReport } from '@/pages/Official/Reports/api/api';
import { extractAddress } from '@/pages/Official/Visualization/api/mapAlerts';
import { useCallback, useEffect, useState } from 'react';

// Transform backend data to frontend format
const transformPendingReport = (report: PendingReport) => {
  return {
    emergencyId: report.alertId,
    communityName: report.terminalName,
    alertType: report.alertType,
    dispatcher: report.dispatcherName,
    dateTimeOccurred: new Date(report.createdAt).toLocaleString(),
    address: extractAddress(report.address)
  };
};

const transformCompletedReport = (report: CompletedReport) => {
  return {
    emergencyId: report.alertId,
    communityName: report.terminalName,
    alertType: report.alertType,
    dispatcher: report.dispatcherName,
    dateTimeOccurred: new Date(report.completedAt).toLocaleString(),
    accomplishedOn: new Date(report.completedAt).toLocaleString(),
    address: extractAddress(report.address)
  };
};

export function useReports() {
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [completedReports, setCompletedReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending reports only
  const fetchPendingReports = useCallback(async () => {
    try {
      setError(null);
      const pendingData = await apiFetchPendingReports(false);
      setPendingReports(pendingData.map(transformPendingReport));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pending reports');
    }
  }, []);

  // Fetch completed reports only
  const fetchCompletedReports = useCallback(async () => {
    try {
      setError(null);
      const completedData = await apiFetchCompletedReports(false);
      setCompletedReports(completedData.map(transformCompletedReport));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch completed reports');
    }
  }, []);

  // Initial data fetch - loads both pending and completed
  const fetchReportsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        fetchPendingReports(),
        fetchCompletedReports()
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, [fetchPendingReports, fetchCompletedReports]);

  // Create a new post rescue form (moves report from pending to completed)
  const createPostRescueForm = useCallback(async (alertId: string, formData: any) => {
    try {
      setError(null);
      
      // Call the API to create the post rescue form
      const { createPostRescueForm: apiCreatePostRescueForm } = await import('@/pages/Official/Reports/api/api');
      const result = await apiCreatePostRescueForm(alertId, formData);
      
      // Optimistically update local state - remove from pending and refresh both lists
      await Promise.all([
        fetchPendingReports(),    // Refresh pending (should have one less)
        fetchCompletedReports()   // Refresh completed (should have one more)
      ]);
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create post rescue form');
      throw err;
    }
  }, [fetchPendingReports, fetchCompletedReports]);

  // Refresh all data
  const refreshAllReports = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPendingReports(),
        fetchCompletedReports()
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchPendingReports, fetchCompletedReports]);

  // Clear cache and refresh (for manual cache clearing)
  const clearCacheAndRefresh = useCallback(async () => {
    try {
      await clearReportsCache();
      await refreshAllReports();
    } catch (err: any) {
      setError(err.message || 'Failed to clear cache');
    }
  }, [refreshAllReports]);

  // Initial data fetch
  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  return {
    // Data
    pendingReports,
    completedReports,
    
    // State
    loading,
    error,
    
    // Actions
    createPostRescueForm,
    refreshAllReports,
    clearCacheAndRefresh
  };
}