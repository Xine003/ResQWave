export type DashboardAlertsProps = {
    editBoundaryOpen: boolean;
    canSave: boolean;
    /** increment to notify saved event; nullable so initial mount doesn't trigger the saved alert */
    savedTrigger: number | null;
    onViewLogs?: () => void;
};

