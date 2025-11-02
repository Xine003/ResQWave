import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import resqwave_logo from '/resqwave_logo.png';

export function LandingHeader({ navOpen, setNavOpen }: { navOpen: boolean, setNavOpen: (open: boolean) => void }) {
  const navigate = useNavigate();
  return (
    <header
      className="flex items-center justify-between  px-10 md:px-20 py-6 border-b border-[#404040] relative"
      style={{
        background: 'rgba(24, 24, 27, 0.5)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(10px) saturate(180%)',
        zIndex: 10,
      }}
    >
      {/* Left side: logo and name */}
      <div className="flex items-center gap-4">
        <img src={resqwave_logo} alt="ResQWave Logo" className="h-auto w-9" />
        <span className="font-medium text-lg ">ResQWave</span>
      </div>
      <div>
        <nav className="header-navs">
          <a href="#importance" className="importance-link">
            Importance
            <span className="underline-effect" />
          </a>
          <a href="#how" className="importance-link">
            How it works
            <span className="underline-effect" />
          </a>
          <a href="#impact" className="importance-link">
            Impact
            <span className="underline-effect" />
          </a>
          <a href="#faqs" className="importance-link">
            FAQs
            <span className="underline-effect" />
          </a>
        </nav>
      </div>
      {/* Desktop nav and button */}
      <div className="hidden md:flex  items-center justify-end gap-4">
        <Button className="bg-gradient-to-b from-[#3B82F6] to-[#70A6FF] hover:from-[#2563eb] hover:to-[#60a5fa]  transition-colors
             duration-300 cursor-pointer text-white text-[14px] px-8 py-2 rounded ml-1 font-medium" onClick={() => navigate('/login-focal')}>
          Login
        </Button>
        {/* <Button className="bg-gradient-to-t from-[#3B82F6] to-[#5898FF] hover:from-[#2563eb] hover:to-[#60a5fa] transition-colors
            duration-300 cursor-pointer text-white text-[14px] px-6 py-2 rounded ml-1 font-medium" onClick={() => navigate('/register-focal')}>
          Register
        </Button> */}
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
        <div className="absolute top-full left-0 w-full bg-[#171717] border-b border-gray-700 z-50 flex flex-col items-end px-4 py-4 gap-4 md:hidden ">
          <nav className="flex flex-col gap-4 w-full cursor-pointer">
            <a href="#importance" className="hover:text-blue-400 transition w-full" onClick={() => setNavOpen(false)}>Importance</a>
            <a href="#how" className="hover:text-blue-400 transition w-full" onClick={() => setNavOpen(false)}>How it works</a>
            <a href="#impact" className="hover:text-blue-400 transition w-full" onClick={() => setNavOpen(false)}>Impact</a>
            <a href="#faqs" className="hover:text-blue-400 transition w-full" onClick={() => setNavOpen(false)}>FAQs</a>
          </nav>
          <Button className="bg-gradient-to-b from-[#3B82F6] to-[#70A6FF] hover:from-[#2563eb] hover:to-[#60a5fa]  text-white px-8 py-2 rounded w-full cursor-pointer" onClick={() => { setNavOpen(false); navigate('/login-focal'); }}>
            Login
          </Button>
          {/* <Button className="from-[#3B82F6] to-[#70A6FF] hover:from-[#2563eb] hover:to-[#60a5fa] text-white px-6 py-2 rounded w-full cursor-pointer" onClick={() => { setNavOpen(false); navigate('/register-focal'); }}>
            Register
          </Button> */}
        </div>
      )}
    </header>
  );
}
