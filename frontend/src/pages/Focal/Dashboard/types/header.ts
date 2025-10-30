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
        onAccountSettingsClick?: () => void;
        onActivityLogClick?: () => void;
        // When the Account Settings (Change Password) modal is open
        accountSettingsOpen?: boolean;
        // Called when header navigation is attempted while account settings modal is open.
        // Parent should show a discard confirmation if the change-password form is dirty,
        // and call the provided continueNavigation() callback if the user confirms.
        onRequestCloseAccountSettings?: (continueNavigation: () => void) => void;
    };
