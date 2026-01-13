export default function SignalStatusLegend() {
    return (
        <div
            style={{
                position: 'absolute',
                bottom: 24,
                left: 20,
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(2,6,23,0.21)',
                padding: '10px 16px',
                display: 'flex',
                flexDirection: 'row',
                gap: 12,
                alignItems: 'center',
            }}
        >
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
                Signal Status:
            </div>

            {/* Your Community */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                    style={{
                        width: 20,
                        height: 12,
                        backgroundColor: '#22c55e',
                        borderRadius: 4,
                    }}
                />
                <span style={{ fontSize: 12, color: '#4a5568', fontWeight: 500 }}>Your Community</span>
            </div>

            {/* Other Community */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                    style={{
                        width: 20,
                        height: 12,
                        backgroundColor: '#6b7280',
                        borderRadius: 4,
                    }}
                />
                <span style={{ fontSize: 12, color: '#4a5568', fontWeight: 500 }}>Other Community</span>
            </div>
        </div>
    );
}
