export type HeaderProps = {
    editBoundaryOpen?: boolean;
    canSave?: boolean;
    onSave?: () => void;
    onExit?: () => void;
    onAboutClick?: () => void;
    // Called by Header when the user attempts to navigate away while editing.
    // Parent should forward this to the edit modal so it can show the discard confirmation.
    onRequestDiscard?: () => void;
    // When the About edit modal is open, inform the header so it can block navigation
    editAboutOpen?: boolean;
    onTabChange?: (value: string) => void;
    activeTab?: string;
};
