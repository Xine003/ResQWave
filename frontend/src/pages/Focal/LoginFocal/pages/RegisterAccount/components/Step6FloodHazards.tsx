import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Step9FloodHazardsProps {
  onNext: (data: { hazards: string[] }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const hazards = [
  "Strong water current (Malakas na agos ng tubig)",
  "Risk of landslide or erosion (Panganib ng pagguho ng lupa)",
  "Drainage overflow / canal blockage (Baradong kanal o daluyan ng tubig)",
  "Roads become impassable (Hindi madaanan ang mga kalsada)",
  "Electrical wires or exposed cables (Mga live o nakalatand na kable ng kuryente)"
];

export function Step9FloodHazards({ onNext, onBack, isLoading = false }: Step9FloodHazardsProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const handleToggle = (hazard: string) => {
    setSelected(prev =>
      prev.includes(hazard)
        ? prev.filter(h => h !== hazard)
        : [...prev, hazard]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ hazards: selected });
  };

  return (
    <>
      <div className="flex flex-col items-start gap-4 mb-8 w-full max-w-[490px]">
        <h1 className="text-4xl font-semibold text-white mb-2 text-center w-full">About Your Neighborhood</h1>
        <p className="text-gray-300 text-start text-base leading-relaxed w-full">
          Check the common flood-related hazards in your area:
        </p>
        <p className="text-gray-500 text-start text-sm italic leading-relaxed w-full">
          (Piliin ang mga karaniwang panganib sa inyong lugar kapag bumabaha)
        </p>
      </div>
      <div className="flex flex-col gap-6 w-full max-w-[490px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          <div className="flex flex-col gap-4">
            {hazards.map((hazard, idx) => (
              <label key={idx} className="flex items-center gap-3 text-white text-base cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selected.includes(hazard)}
                  onChange={() => handleToggle(hazard)}
                  className="sr-only"
                />
                <span
                  className={`flex items-center justify-center h-3 w-3 rounded ${selected.includes(hazard) ? 'bg-[#3B82F6]' : 'bg-[#414141]'}`}
                  style={{ minWidth: '1.1rem', minHeight: '1.1rem' }}
                >
                  {selected.includes(hazard) && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 8L7 11L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-white text-base leading-tight">{hazard}</span>
              </label>
            ))}
          </div>
          <Button
            type="submit"
            className="text-white py-6 rounded-md font-medium text-base flex items-center justify-center gap-2
             bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] 
             hover:from-[#2C64C5] hover:to-[#2C64C5]
             disabled:opacity-50 disabled:cursor-not-allowed
             transition duration-300 mt-4"
          >
            {isLoading ? 'Processing...' : 'Next'}
          </Button>
          <Button
            type="button"
            onClick={onBack}
            className="text-[#BABABA] bg-transparent border-none cursor-pointer hover:text-white hover:bg-transparent mt-2"
          >
            Back
          </Button>
        </form>
      </div>
    </>
  );
}
