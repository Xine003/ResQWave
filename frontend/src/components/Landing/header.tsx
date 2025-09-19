import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import resqwave_logo from '/Landing/resqwave_logo.png';

export function LandingHeader({ navOpen, setNavOpen }: { navOpen: boolean, setNavOpen: (open: boolean) => void }) {
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
      }}
    >
      {/* Left side: logo and name */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <img src={resqwave_logo} alt="ResQWave Logo" className="h-12 w-12" />
        <span className="font-bold text-lg ml-4">ResQWave</span>
      </div>
      {/* Desktop nav and button */}
      <div className="hidden md:flex flex-1 items-center justify-end gap-11">
        <nav className="flex gap-11 text-[16px] header-navs">
          <a href="#importance" className="text-white font-light hover:font-normal transition">Importance</a>
          <a href="#how" className="text-white font-light hover:font-normal transition">How it works</a>
          <a href="#impact" className="text-white font-light hover:font-normal transition">Impact</a>
          <a href="#faqs" className="text-white font-light hover:font-normal transition">FAQs</a>
        </nav>
        <Button className="bg-[#3B82F6] hover:bg-blue-600 duration-150 text-white text-[14px] px-6 py-2 rounded ml-1 font-medium" onClick={() => navigate('/login-focal')}>
          FOCAL LOGIN
        </Button>
      </div>
      {/* Mobile hamburger */}
      <button
        className="md:hidden ml-auto p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Open navigation menu"
        onClick={() => setNavOpen(!navOpen)}
      >
        <Menu size={28} />
      </button>
      {/* Mobile nav menu */}
      {navOpen && (
        <div className="absolute top-full left-0 w-full bg-[#171717] border-b border-gray-700 z-50 flex flex-col items-end px-4 py-4 gap-4 md:hidden animate-in fade-in">
          <nav className="flex flex-col gap-4 w-full cursor-pointer">
            <a href="#importance" className="hover:text-blue-400 transition w-full" onClick={() => setNavOpen(false)}>Importance</a>
            <a href="#how" className="hover:text-blue-400 transition w-full" onClick={() => setNavOpen(false)}>How it works</a>
            <a href="#impact" className="hover:text-blue-400 transition w-full" onClick={() => setNavOpen(false)}>Impact</a>
            <a href="#faqs" className="hover:text-blue-400 transition w-full" onClick={() => setNavOpen(false)}>FAQs</a>
          </nav>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded w-full cursor-pointer" onClick={() => { setNavOpen(false); navigate('/login-focal'); }}>
            FOCAL LOGIN
          </Button>
        </div>
      )}
    </header>
  );
}
