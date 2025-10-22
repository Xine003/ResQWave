import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownIcon } from "@/components/ui/DropdownIcon";

interface Step8FloodwaterDurationProps {
  onNext: (data: { duration: string }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const durations = [
  "Less than 1 hour",
  "1-3 hours",
  "3-6 hours",
  "6-12 hours",
  "12-24 hours",
  "More than 1 day"
];

export function Step8FloodwaterDuration({ onNext, onBack, isLoading = false }: Step8FloodwaterDurationProps) {
  const [duration, setDuration] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (duration) {
      onNext({ duration });
    }
  };

  return (
    <>
      <div className="flex flex-col items-start mb-4 w-full max-w-[490px]">
        <h1 className="text-4xl font-semibold text-white mb-10 text-center w-full mt-2">About Your Neighborhood</h1>
        <p className="text-gray-300 text-start text-base leading-relaxed w-full mb-2">
          How long does it usually take for floodwater to subside?
        </p>
        <p className="text-gray-500 text-start text-[14.5px] italic leading-relaxed w-full">
          (Gaano katagal kadalasan bago humupa ang baha sa inyong lugar?)
        </p>
      </div>
      <div className="flex flex-col gap-6 w-full max-w-[490px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          <div className="relative w-full" ref={dropdownRef}>
            <button
              type="button"
              className="bg-[#171717] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-base flex items-center justify-between"
              onClick={() => setDropdownOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
            >
              {duration ? duration : <span className="text-[#A3A3A3]">Select duration</span>}
              <span className="ml-2">
                <DropdownIcon open={dropdownOpen} />
              </span>
            </button>
            {dropdownOpen && (
              <ul
                className="absolute z-10 mt-1 w-full bg-[#171717] border border-[#404040] rounded-lg shadow-lg"
                role="listbox"
              >
                {durations.map((d, idx) => (
                  <li
                    key={idx}
                    className={`px-4 py-3 text-white text-base cursor-pointer hover:bg-[#232323] ${duration === d ? "bg-[#232323]" : ""}`}
                    role="option"
                    aria-selected={duration === d}
                    onClick={() => {
                      setDuration(d);
                      setDropdownOpen(false);
                    }}
                  >
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button
            type="submit"
            disabled={!duration || isLoading}
            className="text-white py-6 rounded-md font-medium text-base flex items-center justify-center gap-2
             bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] 
             hover:from-[#2C64C5] hover:to-[#2C64C5]
             disabled:opacity-50 disabled:cursor-not-allowed
             transition duration-300 mt-3"
          >
            {isLoading ? 'Processing...' : 'Next'}
          </Button>
          <Button
            type="button"
            onClick={onBack}
            className="text-[#BABABA] bg-transparent border-none cursor-pointer hover:text-white hover:bg-transparent"
          >
            Back
          </Button>
        </form>
      </div>
    </>
  );
}
