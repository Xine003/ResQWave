import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Step5AlternativeFocalPersonProps {
  onNext: (data: { firstName: string; lastName: string; phone: string }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function Step5AlternativeFocalPerson({ onNext, onBack, isLoading = false }: Step5AlternativeFocalPersonProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const isFormValid = firstName.trim() && lastName.trim() && phone.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onNext({ firstName, lastName, phone });
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4 mb-8">
        <h1 className="text-4xl font-semibold text-white mb-2 text-center">Set Alternative Focal Person</h1>
        <p className="text-gray-300 text-center text-base max-w-md leading-relaxed">
          In case you're unreachable, they will be our second point of contact.
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-[490px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-3">First Name</label>
              <Input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="bg-[#171717] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: "16px", height: "48px" }}
                placeholder=""
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-3">Last Name</label>
              <Input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="bg-[#171717] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: "16px", height: "48px" }}
                placeholder=""
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-3">Phone Number</label>
            <div className="flex items-center gap-4">
              <span className="flex items-center px-4 py-[11px] pr-7 bg-[#171717] border border-[#404040] rounded-lg">
                <img src="/public/Landing/phFlag.png" alt="PH" className="w-4 h-3 mr-2" />
                <span className="text-white text-base font-medium">+63</span>
              </span>
              <Input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="bg-[#171717] border border-[#404040] rounded-r-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: "16px", height: "48px" }}
                placeholder=""
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
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
