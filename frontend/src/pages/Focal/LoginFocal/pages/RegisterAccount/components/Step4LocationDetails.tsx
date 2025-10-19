import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Map } from "lucide-react";

interface Step4LocationDetailsProps {
  onNext: (data: { location: string }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function Step4LocationDetails({ onNext, onBack, isLoading = false }: Step4LocationDetailsProps) {
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onNext({ location });
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4 mb-8">
        <h1 className="text-4xl font-semibold text-white mb-2 text-center mt-2">Location Details</h1>
        <p className="text-gray-300 text-center text-base max-w-md leading-relaxed">
          Provide your current location for the terminal placement.
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-[490px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          <div>
            <label className="block text-white text-[15px] font-light mb-3">Your Location</label>
            <div className="relative">
              <Input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="bg-[#171717] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 text-base placeholder-gray-400"
                style={{ fontSize: "16px", height: "50px" }}
                placeholder=""
                required
              />
              <span className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Map className="w-5 h-5" />
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-3">
              Why do we need to know your location? <a href="#" className="underline hover:text-blue-400">Learn more.</a>
            </p>
          </div>

          <Button
            type="submit"
            disabled={!location.trim() || isLoading}
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
            className="text-[#BABABA] bg-transparent border-none cursor-pointer hover:text-white hover:bg-transparent mt-[-3px]"
          >
            Back
          </Button>
        </form>
      </div>
    </>
  );
}
