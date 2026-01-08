import { Info } from "lucide-react";

const cloudName = import.meta.env.VITE_CLOUDINARY_NAME;

const videoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/w_600,h_600,c_fill/AdobeStock_428035875_wmnawt.mp4`;

export function LandingGoal() {

    return (
        <div className="relative w-full h-screen flex">
            {/* Left Side - Video */}
            <div className="w-[60vw] flex items-center justify-center">
                <video
                    className="w-150 h-140 object-cover rounded-[5px] shadow-2xl"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                >
                    <source src={videoUrl} type="video/mp4" />
                </video>
            </div>
            
            {/* Right Side - Content */}
            <div className="w-[40vw] flex items-center justify-start -m-[90px] px-8 pl-12">
                <div className="max-w-xl">
                    <div className="flex gap-3 mb-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-[5px] border border-zinc-700/50 transition-all duration-300 hover:bg-zinc-800/70 hover:border-zinc-600/70 hover:scale-105 cursor-pointer">
                            <Info className="w-4 h-4 text-zinc-300" />
                            <span className="text-sm text-zinc-300">Why ResQWave Matters</span>
                        </div>
                    </div>
                    
                    <h5
                        className="text-[20px] md:text-[24px] lg:text-[28px] font-bold mb-6 leading-tight"
                        style={{
                            background: "linear-gradient(180deg, #FFFFFF 0%, #BFBFBF 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            color: "transparent"
                        }}
                    >
                        When disasters strike in the Philippines, communication often fails first.
                    </h5>
                    
                    <p className="text-[16px] md:text-[18px] text-gray-300 leading-relaxed">
                        Power outages, downed cell towers, and lack of internet leave communities cut off, making it harder for families to call for help and for officials to know who needs urgent rescue. In many cases, delays in communication cost lives.
                    </p>
                </div>
            </div>
        </div>
    )
}
