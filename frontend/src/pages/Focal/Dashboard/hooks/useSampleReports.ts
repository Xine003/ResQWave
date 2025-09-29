import type { ReportGroup } from '../types/history';

// Sample reports extracted from the component and exposed via a small hook/module.
// This keeps sample data centralized for usage in previews or local development.
const SAMPLE_REPORTS: ReportGroup[] = [
    {
        monthLabel: 'September 2025',
        count: 3,
        items: [
            { id: 'DOC_EMG_009', date: 'September 17, 2025', type: 'Critical' },
            { id: 'DOC_EMG_008', date: 'September 10, 2025', type: 'User Initiated' },
            { id: 'DOC_EMG_007', date: 'September 1, 2025', type: 'Critical' },
        ],
    },
    {
        monthLabel: 'October 2025',
        count: 2,
        items: [
            { id: 'DOC_EMG_002', date: 'October 2, 2025', type: 'User Initiated' },
            { id: 'DOC_EMG_001', date: 'October 5, 2025', type: 'Critical' },
        ],
    },
    {
        monthLabel: 'November 2025',
        count: 2,
        items: [
            { id: 'DOC_EMG_002', date: 'October 2, 2025', type: 'User Initiated' },
            { id: 'DOC_EMG_001', date: 'October 5, 2025', type: 'Critical' },
        ],
    },
];

export function useSampleReports() {
    // Simple hook wrapper in case we want to expand behavior later
    return { sampleReports: SAMPLE_REPORTS } as const;
}

export default SAMPLE_REPORTS;
