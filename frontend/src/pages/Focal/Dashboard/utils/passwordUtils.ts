export function validatePassword(newPassword: string, confirmPassword: string) {
    const pw = newPassword || '';
    const hasMinLength = pw.length >= 8;
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>\[\]\\/~`_+\-=;]/.test(pw);
    const passwordsMatch = pw.length > 0 && pw === confirmPassword;
    return { hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial, passwordsMatch };
}

export function isAccountFormDirty(currentPassword: string, newPassword: string, confirmPassword: string) {
    return (currentPassword.length > 0) || (newPassword.length > 0) || (confirmPassword.length > 0);
}
