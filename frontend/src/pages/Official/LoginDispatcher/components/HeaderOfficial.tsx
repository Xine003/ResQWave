import { useNavigate } from "react-router-dom";
import resqwave_logo from '/Landing/resqwave_logo.png';

export function HeaderOfficial() {
    const navigate = useNavigate();
    return (
        <header
            className="flex items-center px-10 md:px-20 py-6 border-b border-[#404040] relative"
            style={{
                background: 'rgba(24, 24, 27, 0.65)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                borderBottom: '1px solid #404040',
                zIndex: 10,
                minHeight: '72px',
            }}
        >
            <div className="flex items-center gap-2 flex-shrink-0" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <img src={resqwave_logo} alt="ResQWave Logo" className="h-12 w-12" />
                <span className="font-bold text-lg ml-4 text-white" style={{ fontSize: '1.125rem' }}>ResQWave</span>
            </div>
        </header>
    );
}