import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";
import resqwave_logo from '/Landing/resqwave_logo.png';
import basemap_image from '/Landing/basemap_image.png';

export function Landing() {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="min-h-screen text-white flex flex-col primary-background">
      {/* Header */}
      <header className="flex items-center px-10 md:px-20 py-6 primary-background border-b border-[#404040] relative">
        {/* Left side: logo and name */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <img src={resqwave_logo} alt="ResQWave Logo" className="h-12 w-12" />
          <span className="font-bold text-base  ml-2">ResQWave</span>
        </div>
        {/* Desktop nav and button */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-8">
          <nav className="flex gap-8 header-navs">
            <a href="#importance" className="hover:text-white transition">Importance</a>
            <a href="#how" className="hover:text-white transition">How it works</a>
            <a href="#impact" className="hover:text-white transition">Impact</a>
            <a href="#faqs" className="hover:text-white transition">FAQs</a>
          </nav>
          <Button className="bg-[#3B82F6] hover:bg-blue-600 duration-150 text-white px-6 py-2 rounded ml-1 font-medium" onClick={() => navigate('/login-focal')}>
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

      {/* Hero Section */}
      <main className="flex flex-1 flex-col md:flex-row items-center justify-between px-20 md:px-48 gap-8 md:gap-16 w-full relative" style={{overflow: 'hidden'}}>
  {/* ...existing code... */}
        {/* Left Side */}
        <div className="w-full md:w-3/5 flex flex-col justify-center items-start md:items-start max-w-2xl">
          <h1
            className="text-[40px] md:text-[55px] font-bold mb-6 leading-tight"
            style={{
              background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent"
            }}
          >
            Stronger Signals,<br />Safer Communities
          </h1>
          <p className="mb-8 text-[20px] text-gray-300 leading-relaxed" >
            A simple, reliable terminal powered by LoRa—helping <br />
            <span style={{ display: 'inline-block', height: '1.5em' }}></span>
            communities send SOS alerts, share updates, and guide rescuers<br />
            <span style={{ display: 'inline-block', height: '1.5em' }}></span>
            when flooding strikes.
          </p>
          <Button className="bg-white text-black px-7 py-7 rounded shadow hover:bg-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => {/* TODO: Add action */ }}>
            Am I part of a community?
          </Button>
        </div>
        {/* Right Side Hero Section Background */}
        <div className="w-full md:w-1/2 mt-8 md:mt-0" style={{position: 'relative', zIndex: 1}}>
          {/* Radial Gradient Background - right side of hero section */}
          <div
            style={{
              position: 'absolute',
              right: '-67%',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '900px',
              height: '900px',
              zIndex: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #515151 0%, #171717 100%)',
              opacity: 0.85,
              pointerEvents: 'none',
              filter: 'blur(20px)',
            }}
          />
          <div className="rounded-2xl overflow-hidden" style={{ width: 1021, height: 698, position: 'relative', zIndex: 1 }}>
            {/* Replace with actual map and overlays if available */}
            <img src={basemap_image} alt="Map" className="w-full h-full" />
            {/* Overlay example (static for now) */}
            {/* You can add absolutely positioned overlays here if needed */}
          </div>
        </div>
      </main>
    </div>
  );
}