export type HeaderProps = {
    editBoundaryOpen?: boolean;
    canSave?: boolean;
    onSave?: () => void;
    onExit?: () => void;
    onAboutClick?: () => void;
    onTabChange?: (value: string) => void;
    activeTab?: string;
};
