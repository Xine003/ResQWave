import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Header() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [activeTab, setActiveTab] = useState<"map" | "table">("map");
  const navigate = useNavigate();

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const dateString = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setCurrentTime(timeString);
      setCurrentDate(dateString);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTabClick = (tab: "map" | "table") => {
    setActiveTab(tab);
    if (tab === "map") {
      navigate("/visualization");
    } else {
      navigate("/tabular");
    }
  };

  return (
    <header
      className={`h-auto min-h-18 bg-[#171717] border-b border-[#2a2a2a] flex flex-wrap md:flex-nowrap items-center justify-between px-4 md:px-6 py-2 md:py-0`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 w-full md:w-auto">
        <h1 className="text-white font-semibold text-base md:text-lg tracking-wide">
          BARANGAY 175
        </h1>

        <div className="flex items-center bg-[#262626] p-1 rounded-[5px] w-full md:w-auto">
          <button
            onClick={() => handleTabClick("map")}
            className={`flex-1 md:flex-none px-3 md:px-4 py-1 rounded-[5px] text-xs md:text-sm font-medium transition-colors ${
              activeTab === "map"
                ? "bg-[#414141] text-white"
                : "bg-[#2a2a2a] text-white/60 hover:text-white hover:bg-[#333333]"
            }`}
          >
            Map View
          </button>
          <button
            onClick={() => handleTabClick("table")}
            className={`flex-1 md:flex-none px-3 md:px-4 py-1 rounded-[5px] text-xs md:text-sm font-medium transition-colors ${
              activeTab === "table"
                ? "bg-[#414141] text-white"
                : "text-white/60 hover:text-white hover:bg-[#333333]"
            }`}
          >
            Table View
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 text-white/90 text-xs md:text-sm mt-2 md:mt-0 w-full md:w-auto justify-end">
        <span className="font-medium">{currentTime}</span>
        <div className="w-px h-6 bg-white/70"></div>
        <span className="text-white/70">{currentDate}</span>
      </div>
    </header>
  );
}