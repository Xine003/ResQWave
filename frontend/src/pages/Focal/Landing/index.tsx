import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import resqwave_logo from '/Landing/resqwave_logo.png';
import basemap_image from '/Landing/basemap_image.png';

export function Landing() {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
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
          <Button className="bg-[#3B82F6] hover:bg-blue-600 duration-150 text-white px-6 py-2 rounded ml-1 font-medium" onClick={() => setShowLogin(true)}>
            FOCAL LOGIN
          </Button>
      {/* FOCAL LOGIN MODAL */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="bg-[#18181b] border-none shadow-2xl max-w-md mx-auto">
          <DialogHeader>
            <div className="flex flex-col items-center gap-2">
              <img src={resqwave_logo} alt="ResQWave Logo" className="h-14 w-14 mb-2" />
              <DialogTitle className="text-3xl font-bold text-white mb-1">Sign in</DialogTitle>
              <DialogDescription className="text-gray-300 text-center mb-4">Log in using your account credentials. For focal person's use only.</DialogDescription>
            </div>
          </DialogHeader>
          <form className="flex flex-col gap-4 mt-2">
            <input type="text" placeholder="ID" className="bg-[#232323] border border-[#333] rounded-md px-4 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="relative">
              <input type="password" placeholder="Password" className="bg-[#232323] border border-[#333] rounded-md px-4 py-3 text-white text-base w-full focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                {/* Eye icon (static for now) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#888" d="M12 5c-7 0-9 7-9 7s2 7 9 7 9-7 9-7-2-7-9-7zm0 12c-5.05 0-7.07-4.13-7.72-5C4.93 11.13 6.95 7 12 7s7.07 4.13 7.72 5c-.65.87-2.67 5-7.72 5zm0-8a3 3 0 100 6 3 3 0 000-6zm0 5a2 2 0 110-4 2 2 0 010 4z"/></svg>
              </span>
            </div>
            <Button type="submit" className="bg-[#2563eb] hover:bg-blue-700 text-white py-3 rounded-md font-semibold text-base mt-2">Sign in</Button>
          </form>
          <div className="text-center mt-2">
            <button className="text-gray-400 hover:text-blue-400 text-sm underline bg-transparent border-none cursor-pointer">Forgot Password?</button>
          </div>
          <DialogClose asChild>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl bg-transparent border-none cursor-pointer">&times;</button>
          </DialogClose>
        </DialogContent>
      </Dialog>
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
      <main className="flex flex-1 flex-col md:flex-row items-center justify-between px-20 md:px-48 gap-8 md:gap-16 w-full relative" style={{ overflow: 'hidden' }}>
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
          {/* Animated transition between button and search UI */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 350, minHeight: 56, overflow: 'hidden' }}>
            {/* Button (hidden when search is shown) */}
            <Button
              className={`bg-white text-black px-7 py-7 rounded shadow hover:bg-gray-200 hover:shadow-lg transition-all duration-500 cursor-pointer ${showSearch ? 'opacity-0 pointer-events-none translate-x-32' : 'opacity-100 translate-x-0'}`}
              style={{ width: '100%', position: 'absolute', left: 0, top: 0, transition: 'all 0.5s cubic-bezier(.4,0,.2,1), transform 0.5s cubic-bezier(.4,0,.2,1)' }}
              onClick={() => setShowSearch(true)}
            >
              Am I part of a community?
            </Button>
            {/* Search UI (shown when search is triggered) */}
            <div
              className={`flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 gap-2 shadow transition-all duration-500 ${showSearch ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-32'}`}
              style={{ width: '100%', position: 'absolute', left: 0, top: 0, minHeight: 56, transition: 'all 0.5s cubic-bezier(.4,0,.2,1), transform 0.5s cubic-bezier(.4,0,.2,1)' }}
            >
              {/* Location icon */}
              <span style={{ display: 'flex', alignItems: 'center', color: '#2563eb', fontSize: 22 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#2563eb" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 6.25 12.25 6.53 12.53.29.29.76.29 1.06 0C12.75 21.25 19 14.25 19 9c0-3.87-3.13-7-7-7zm0 17.88C10.09 17.07 7 13.19 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 4.19-3.09 8.07-5 10.88z"></path><circle cx="12" cy="9" r="2.5" fill="#2563eb" /></svg>
              </span>
              <input
                type="text"
                placeholder="Search Location"
                className="flex-1 outline-none bg-transparent text-black text-base px-2"
                style={{ border: 'none', minWidth: 0 }}
              />
              <button
                className="bg-[#2563eb] rounded-full p-2 flex items-center justify-center hover:bg-blue-700 transition"
                style={{ border: 'none' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="#fff" strokeWidth="2" /><path stroke="#fff" strokeWidth="2" strokeLinecap="round" d="M20 20l-3-3" /></svg>
              </button>
            </div>
          </div>
        </div>
        {/* Right Side Hero Section Background */}
        <div className="w-full md:w-1/2 mt-8 md:mt-0" style={{ position: 'relative', zIndex: 1 }}>
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