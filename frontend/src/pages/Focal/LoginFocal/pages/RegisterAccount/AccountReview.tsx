import { useNavigate } from "react-router-dom";
import CircleCheck from "@/components/ui/CircleCheck";
import { FocalHeader } from "@/pages/Focal/LoginFocal/components/FocalHeader";

export default function AccountReview() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col primary-background" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="loginfocal-radial-gradient" />
      <FocalHeader />
      <main className="flex flex-1 flex-col items-center justify-center w-full" style={{ zIndex: 20, position: 'relative' }}>
  <div className="flex flex-col items-center justify-center w-full max-w-lg">
          <div className="flex flex-col items-center justify-center mb-2">
            <div className="mb-6 p-4 rounded" style={{ background: 'rgba(255, 187, 0, 0.10)' }}>
              <CircleCheck size={42} color="#FFD600" checkColor="#232323" />
            </div>
            <h1 className="text-3xl font-bold text-white text-center mb-9">We’ll review your account!</h1>
          </div>
          <p className="text-gray-300 text-center text-base max-w-[470px] leading-relaxed mb-9">
            Your registration has been submitted and is now under approval.<br />
            You’ll receive a notification once your account has been verified<br />
            by the team.
          </p>
          <p className="text-gray-400 text-center text-md max-w-xl leading-relaxed mb-9">
            For inquiries or more information, visit <a href="https://help.resqwave.com" className="text-blue-400 underline">ResQWave Help Center</a>.
          </p>
          <button
            className="text-white py-4 rounded-md font-medium text-base flex items-center justify-center gap-2 w-full max-w-[470px] bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] hover:from-[#2C64C5] hover:to-[#2C64C5] transition duration-300"
            onClick={() => navigate('/login-focal')}
          >
            Back to Login
          </button>
        </div>
      </main>
    </div>
  );
}
