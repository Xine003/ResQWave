import { Button } from "@/components/ui/button";
import basemap_image from '/Landing/basemap_image.png';

export function LandingHero({ showSearch, setShowSearch }: { showSearch: boolean, setShowSearch: (show: boolean) => void }) {
  return (
    <main className="flex flex-1 flex-col md:flex-row items-center justify-between px-20 md:px-48 gap-8 md:gap-16 w-full relative" style={{ overflow: 'hidden', zIndex: 20, position: 'relative' }}>
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
      <div className="w-full md:w-[53.6%] mt-8 md:mt-0" style={{ position: 'relative', zIndex: 1 }}>
        <div className="rounded-2xl overflow-hidden" style={{ width: 1021, height: 704, position: 'relative', zIndex: 1 }}>
          {/* Replace with actual map and overlays if available */}
          <img src={basemap_image} alt="Map" className="w-full h-full" />
          {/* Overlay example (static for now) */}
          {/* You can add absolutely positioned overlays here if needed */}
        </div>
      </div>
    </main>
  );
}
