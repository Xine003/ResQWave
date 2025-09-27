import React from 'react';

type AlertProps = {
    variant?: 'default' | 'destructive';
    iconBoxVariant?: 'default' | 'note' | 'success';
    children?: React.ReactNode;
    className?: string;
};

export function Alert({ variant = 'default', iconBoxVariant = 'default', children, className = '' }: AlertProps) {
    const baseStyle: React.CSSProperties = {
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        padding: '17px 22px',
        borderRadius: 7,
        boxShadow: '0 12px 30px rgba(2,6,23,0.42)',
    };

    const variants: Record<string, React.CSSProperties> = {
        default: { background: '#000', color: '#fff' },
        destructive: { background: '#000', color: '#fff' },
    };

    // Support children like: <Alert><Icon /> <div><AlertTitle>...</AlertTitle><AlertDescription>...</AlertDescription></div></Alert>
    const ch = React.Children.toArray(children);
    const icon = ch.length > 0 ? ch[0] : null;
    const content = ch.length > 1 ? ch.slice(1) : null;

    // base icon box
    const iconBoxBase: React.CSSProperties = (() => {
        if (iconBoxVariant === 'success') {
            return {
                width: 54,
                height: 49,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            };
        }
        if (iconBoxVariant === 'note') {
            return {
                width: 80,
                height: 54,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            };
        }
        return {
            width: 80,
            height: 54,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        };
    })();

    const iconBoxStyle: React.CSSProperties = (() => {
        if (iconBoxVariant === 'success') {
            return {
                ...iconBoxBase,
                background: 'rgba(44,190,0,0.20)'
            };
        }
        if (iconBoxVariant === 'note') {
            return {
                ...iconBoxBase,
                background: 'rgba(59,130,246,0.13)'
            };
        }
        return {
            ...iconBoxBase,
            background: 'rgba(59,130,246,0.13)'
        };
    })();

    const contentStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

    return (
        <div style={{ ...baseStyle, ...variants[variant] }} className={className} role="status" aria-live="polite">
            <div style={iconBoxStyle}>{icon}</div>
            <div style={contentStyle}>{content}</div>
        </div>
    );
}

export function AlertTitle({ children }: { children?: React.ReactNode }) {
    return <div style={{ fontSize: 14, color: '#fff', marginBottom: 6 }}>{children}</div>;
}

export function AlertDescription({ children }: { children?: React.ReactNode }) {
    return <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', lineHeight: 1.45 }}>{children}</div>;
}

export default Alert;
