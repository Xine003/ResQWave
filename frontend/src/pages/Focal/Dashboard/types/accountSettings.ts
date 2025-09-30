export type AccountSettingsModalProps = {
    open: boolean;
    onClose: () => void;
    onSaved?: () => void;
    center?: { x: number; y: number } | null;
    // optional ref-like callback from parent to query whether the form has unsaved changes
    isDirtyRef?: React.MutableRefObject<() => boolean> | null;
};

export type PasswordValidation = {
    hasMinLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    passwordsMatch: boolean;
};
