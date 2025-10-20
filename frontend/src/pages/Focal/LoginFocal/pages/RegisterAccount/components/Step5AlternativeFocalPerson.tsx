import { useState } from "react";
import { CircleAlert } from 'lucide-react';
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
  const [error, setError] = useState("");

  // Philippine mobile number validation (same as RegisterAccount)
  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^9\d{9}$/;
    return phoneRegex.test(cleanPhone);
  };

  // Button is enabled if phone is exactly 10 digits and first/last name are filled
  const isFormValid = firstName.trim() && lastName.trim() && phone.length === 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validatePhoneNumber(phone)) {
      setError("Please enter a valid Philippine mobile number (e.g., 9XX XXX XXXX).\nMust be 10 digits, start with 9.");
      return;
    }
    onNext({ firstName, lastName, phone });
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4 mb-8">
        <h1 className="text-4xl font-semibold text-white mb-2 text-center mt-2">Set Alternative Focal Person</h1>
        <p className="text-gray-300 text-center text-base max-w-md leading-relaxed">
          In case you're unreachable, they will be our second point of contact.
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-[490px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          {error && (
            <div className="flex items-center gap-5 bg-[#291415] border border-[#F92626] text-red-200 rounded-md px-5 py-4 mb-2 animate-in fade-in w-full">
              <CircleAlert className="text-[#F92626]" size={22} />
              <div>
                <span className="font-bold text-[#F92626]">
                  {error.includes("valid Philippine") ? "Invalid phone number" : "Error"}
                </span><br />
                <span className="text-[#F92626] text-[14px]">{error}</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-[15px] font-light mb-3">First Name</label>
              <Input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="bg-[#171717] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: "16px", height: "50px" }}
                placeholder=""
                required
              />
            </div>
            <div>
              <label className="block text-white text-[15px] font-light mb-3">Last Name</label>
              <Input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="bg-[#171717] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: "16px", height: "50px" }}
                placeholder=""
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-white text-[15px] font-light mb-3">Phone Number</label>
            <div className="flex items-center gap-3">
              <span className="flex items-center px-4 py-[13px] pr-7 bg-[#171717] border border-[#404040] rounded-lg">
                <img src="/public/Landing/phFlag.png" alt="PH" className="w-4 h-3 mr-2" />
                <span className="text-[#A3A3A3] text-[15px] font-medium">+63</span>
              </span>
              <Input
                type="tel"
                value={phone}
                onChange={e => {
                  // Only allow up to 10 digits, remove non-digits
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length > 10) val = val.slice(0, 10);
                  setPhone(val);
                  if (error) setError("");
                }}
                className={`bg-[#171717] border rounded-r-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${phone && !validatePhoneNumber(phone) ? "border-red-500" : "border-[#404040]"
                  }`}
                style={{ fontSize: "16px", height: "50px" }}
                placeholder="9XX XXX XXXX"
                maxLength={10}
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
            className="text-[#BABABA] bg-transparent border-none cursor-pointer hover:text-white hover:bg-transparent"
          >
            Back
          </Button>
        </form>
      </div>
    </>
  );
}
