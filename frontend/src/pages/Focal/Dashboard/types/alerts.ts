export type DashboardAlertsProps = {
    editBoundaryOpen: boolean;
    canSave: boolean;
    /** increment to notify saved event */
    savedTrigger: number;
    onViewLogs?: () => void;
};

