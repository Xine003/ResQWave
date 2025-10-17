import { useNavigate, useLocation } from "react-router-dom";
import resqwave_logo from '/Landing/resqwave_logo.png';
import { CircleQuestionMark } from 'lucide-react';

export function FocalHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine text and navigation based on current page
    const isRegisterPage = location.pathname === '/register-focal';
    const buttonText = isRegisterPage ? 'Sign in instead' : 'Create an account';
    const handleClick = () => {
        if (isRegisterPage) {
            navigate('/login-focal');
        } else {
            navigate('/register-focal');
        }
    };
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
            <div className="flex flex-1 items-center justify-end gap-11">
                <button 
                    className="text-gray-300 hover:text-white text-[16px] flex items-center gap-2 bg-transparent border-none cursor-pointer"
                    onClick={handleClick}
                >
                    <span className="underline text-[#BABABA] hover:text-gray-300 text-[15px] flex items-center gap-2 bg-transparent border-none cursor-pointer">{buttonText}</span>
                </button>
            </div>
        </header>
    );
}
