export type ReportItem = {
    id: string;
    date: string; // human readable date for samples; prefer ISO from real API
    type?: string;
    rescueCompleted?: boolean;
    prfCompletedAt?: string;
    timeOfRescue?: string;
    emergencyId?: string;
    alertId?: string;
    alertType?: string;
};

export type ReportGroup = {
    monthLabel: string;
    count: number;
    items: ReportItem[];
};

