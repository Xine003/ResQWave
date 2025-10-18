import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Step10OtherInfoProps {
  onNext: (data: { otherInfo: string }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function Step10OtherInfo({ onNext, onBack, isLoading = false }: Step10OtherInfoProps) {
  const [otherInfo, setOtherInfo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ otherInfo });
  };

  return (
    <>
      <div className="flex flex-col items-start gap-4 mb-5 w-full max-w-[490px]">
        <h1 className="text-4xl font-semibold text-white mb-2 text-center w-full">About Your Neighborhood</h1>
        <label className="text-white text-sm font-medium mb-1">Other notable information</label>
        <p className="text-gray-500 text-start text-sm italic leading-relaxed w-full mb-2">
          (Maglagay ng iba pang mahahalagang detalye tungkol sa kalagayan ng baha sa inyong lugar)
        </p>
      </div>
      <div className="flex flex-col gap-6 w-full max-w-[490px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          <textarea
            value={otherInfo}
            onChange={e => setOtherInfo(e.target.value)}
            placeholder="More info about my community ..."
            className="bg-[#171717] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-base min-h-[130px]"
          />
          <Button
            type="submit"
            disabled={isLoading}
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
            className="text-[#BABABA] bg-transparent border-none cursor-pointer hover:text-white hover:bg-transparent mt-2"
          >
            Back
          </Button>
        </form>
      </div>
    </>
  );
}
