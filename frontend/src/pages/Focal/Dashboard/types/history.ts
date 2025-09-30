export type ReportItem = {
    id: string;
    date: string; // human readable date for samples; prefer ISO from real API
    type?: string;
};

export type ReportGroup = {
    monthLabel: string;
    count: number;
    items: ReportItem[];
};

