import { Ripple } from "@/components/ui/ripple";

export function LandingCTA() {
  return (
    <section className="h-screen px-6 md:px-12 lg:px-24 flex items-center justify-center relative">
      {/* Ripple Background with Blue Shades */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <style>{`
          .cta-ripple .animate-ripple {
            background: rgba(59, 130, 246, 1) !important;
            border-color: rgba(147, 197, 253, 2) !important;
          }
        `}</style>
        <div className="cta-ripple absolute inset-0">
          <Ripple mainCircleSize={210} mainCircleOpacity={0.2} numCircles={8} />
        </div>
      </div>
      
      <div className="max-w-4xl w-full text-center relative z-10">
        {/* Header */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Lead the Wave of Safety.
        </h2>
        
        {/* Paragraph */}
        <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
          Take part in building safer, more connected communities. As a focal leader, you'll be the bridge between families in need and the responders who can save them.
        </p>
        
        {/* Button */}
        <button className="bg-white text-black font-semibold px-8 py-4 rounded-md hover:bg-gray-100 transition-colors duration-200">
          Interested? Contact Us Now!
        </button>
      </div>
    </section>
  );
}
