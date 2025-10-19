import { useState } from "react";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownIcon } from "@/components/ui/DropdownIcon";

interface Step7AboutResidentsProps {
  onNext: (data: { range: string }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const ranges = [
  "1-100",
  "100-200",
  "200-300",
  "300-400",
  "400-500",
  "500+"
];

export function Step7AboutResidents({ onNext, onBack, isLoading = false }: Step7AboutResidentsProps) {
  const [range, setRange] = useState("");
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
    if (range) {
      onNext({ range });
    }
  };

  return (
    <>
      <div className="flex flex-col items-start mb-4 w-full max-w-[490px]">
        <h1 className="text-4xl font-semibold text-white mb-10 text-center w-full mt-2">About Your Neighborhood</h1>
        <p className="text-gray-300 text-start text-base leading-relaxed w-full mb-2">
          With approximately how many no. of residents?
        </p>
        <p className="text-gray-500 text-start text-[14.5px] italic leading-relaxed w-full">
          (Na may tinatayang ilang residente?)
        </p>
      </div>
      <div className="flex flex-col gap-6 w-full max-w-[490px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          <div className="relative w-full" ref={dropdownRef}>
            <button
              type="button"
              className="bg-[#171717] border border-[#404040] rounded-lg px-4 [52px] py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-base flex items-center justify-between"
              onClick={() => setDropdownOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
            >
              {range ? range : <span className="text-[#A3A3A3]">Select a range</span>}
              <span className="ml-2">
                <DropdownIcon open={dropdownOpen} />
              </span>
            </button>
            {dropdownOpen && (
              <ul
                className="absolute z-10 mt-1 w-full bg-[#171717] border border-[#404040] rounded-lg shadow-lg"
                role="listbox"
              >
                {ranges.map((r, idx) => (
                  <li
                    key={idx}
                    className={`px-4 py-3 text-white text-base cursor-pointer hover:bg-[#232323] ${range === r ? "bg-[#232323]" : ""}`}
                    role="option"
                    aria-selected={range === r}
                    onClick={() => {
                      setRange(r);
                      setDropdownOpen(false);
                    }}
                  >
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button
            type="submit"
            disabled={!range || isLoading}
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
