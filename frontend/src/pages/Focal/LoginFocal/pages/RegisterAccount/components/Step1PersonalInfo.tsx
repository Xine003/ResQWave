import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";

interface Step1PersonalInfoProps {
  onNext: (data: { firstName: string; lastName: string; dateOfBirth: Date | undefined }) => void;
  onBack: () => void;
  isLoading?: boolean;
  initialData?: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date | undefined;
  };
}

export function Step1PersonalInfo({ onNext, onBack, isLoading = false, initialData }: Step1PersonalInfoProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(initialData?.dateOfBirth);

  const handleNext = () => {
    if (firstName.trim() && lastName.trim() && dateOfBirth) {
      onNext({ firstName, lastName, dateOfBirth });
    }
  };

  const isFormValid = firstName.trim() && lastName.trim() && dateOfBirth;

  return (
    <>
      {/* Main Content */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <h1 className="text-[43px] font-medium leading-snug text-white mb-2 text-center">Tell us about You</h1>
        <p className="text-gray-300 text-center text-base max-w-md leading-relaxed">
          The following information will be used as the main focal person of the neighborhood.
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-[490px]">
        {/* First Name and Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-[15px] font-light mb-3">
              First Name
            </label>
            <Input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="bg-[#171717] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ fontSize: "16px", height: "50px" }}
              placeholder=""
            />
          </div>
          <div>
            <label className="block text-white text-[15px] font-light mb-3">
              Last Name
            </label>
            <Input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="bg-[#171717] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ fontSize: "16px", height: "50px" }}
              placeholder=""
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-white text-[15px] font-light mb-3">
            Date of Birth
          </label>
          <DatePicker
            value={dateOfBirth}
            onSelect={setDateOfBirth}
            placeholder="Date of Birth"
            className="w-full"
          />
          <p className="text-gray-400 text-sm mt-3">
            Why do we need your date of birth? <span className="text-gray-400 underline hover:text-blue-400 cursor-pointer">Learn more</span>
          </p>
        </div>

        {/* Action Buttons */}
        <Button
          onClick={handleNext}
          disabled={isLoading || !isFormValid}
          className="text-white py-6 rounded-md font-medium text-base mt-4 flex items-center justify-center gap-2
           bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] 
           hover:from-[#2C64C5] hover:to-[#2C64C5]
           disabled:bg-[#232323] disabled:text-[#929090] disabled:cursor-not-allowed
           transition duration-300"
          style={{ 
            opacity: isLoading ? 0.7 : 1,
            background: !isFormValid ? '#232323' : undefined
          }}
        >
          {isLoading && (
            <span className="inline-block mr-2">
              <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </span>
          )}
          {isLoading ? 'Processing...' : 'Next'}
        </Button>

        <Button
          onClick={onBack}
          className="text-[#BABABA] bg-transparent border-none cursor-pointer hover:text-white hover:bg-transparent mt-[-3px]"
        >
          Back
        </Button>
      </div>
    </>
  );
}