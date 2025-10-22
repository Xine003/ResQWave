import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FocalHeader } from '@/pages/Focal/LoginFocal/components/FocalHeader';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CircleAlert } from 'lucide-react';

export function RegisterAccount() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [inputMode, setInputMode] = useState<"phone" | "email">("phone");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Phone number formatting function
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as XXX XXX XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
    }
  };

  // Phone number validation function
  const validatePhoneNumber = (phone: string): boolean => {
    // Remove any spaces, dashes, or parentheses
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Check if it's a valid Philippine mobile number
    // Should be 10 digits (after +63) starting with 9
    const phoneRegex = /^9\d{9}$/;
    
    return phoneRegex.test(cleanPhone);
  };

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Reset error state
    setError("");

    if (inputMode === "phone") {
      // Check if phone number is provided
      if (!phoneNumber.trim()) {
        setError("Please enter your phone number.");
        return;
      }

      // Validate phone number format
      if (!validatePhoneNumber(phoneNumber)) {
        setError("Please enter a valid Philippine mobile number (e.g., 9XX XXX XXXX).");
        return;
      }
    } else {
      // Check if email is provided
      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }

      // Validate email format
      if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }
    }

    // Check if terms are agreed
    if (!agreeToTerms) {
      setError("You must agree to the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setError("");
      setIsLoading(false);
      // Navigate to verification page with contact info
      if (inputMode === "phone") {
        console.log("Registration submitted with phone:", phoneNumber);
        navigate(`/verify-account-focal?mode=phone&contact=${encodeURIComponent(phoneNumber)}`);
      } else {
        console.log("Registration submitted with email:", email);
        navigate(`/verify-account-focal?mode=email&contact=${encodeURIComponent(email)}`);
      }
    }, 2000);
  }

  return (
    <div className="min-h-screen flex flex-col primary-background" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="loginfocal-radial-gradient" />
      <FocalHeader />
      <main className="flex flex-1 flex-col items-center w-full" style={{ marginTop: '120px', zIndex: 20, position: 'relative' }}>
        <div className="flex flex-col items-center gap-4 mb-7">
            <h1 className="text-[43px] font-medium leading-snug text-white mb-3 max-w-[500px] text-center break-words">Be your Community's Focal Person</h1>
            <p className="text-[#BABABA] text-center mb-2 max-w-[400px] leading-[30px]">
            To start, please provide your {inputMode === "phone" ? "primary phone number" : "primary email address"} or{' '}
            <button
              type="button"
              onClick={() => {
                setInputMode(inputMode === "phone" ? "email" : "phone");
                setError("");
              }}
              className="text-[#3B82F6] hover:text-blue-500 bg-transparent border-none cursor-pointer underline"
            >
              {inputMode === "phone" ? "use email instead" : "use phone number instead"}
            </button>
            .
            </p>
        </div>

        {/* Error Alert UI - Similar to Sign In page */}
        {error && !error.includes("agree to") && (
          <div className="flex items-center gap-5 bg-[#291415] border border-[#F92626] text-red-200 rounded-md px-5 py-4 mb-4 animate-in fade-in w-full max-w-[490px] mx-auto">
            <CircleAlert className="text-[#F92626]" size={22} />
            <div>
              <span className="font-bold text-[#F92626]">
                {error.includes("valid Philippine") ? "Invalid phone number" : 
                 error.includes("valid email") ? "Invalid email address" :
                 "Missing input"}
              </span><br />
              <span className="text-[#F92626] text-[14px]">{error}</span>
            </div>
          </div>
        )}

        <form className="flex flex-col gap-4 w-full max-w-[490px]" onSubmit={handleSubmit}>
          <div>
            <label className="block text-white text-[15.2px] font-normal mb-4">
              {inputMode === "phone" ? "Phone Number" : "Email"}
            </label>
            {inputMode === "phone" ? (
              <div className="flex gap-3">
                <div className="flex items-center justify-center bg-[#171717] border border-[#404040] rounded-lg px-4.5 py-4 min-w-[85px]">
                  <span className="text-[#A3A3A3] text-[15px] flex items-center gap-2">
                    <img src="/Landing/phFlag.png" alt="PH Flag" className="w-5 h-4" />
                    +63
                  </span>
                </div>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => {
                    const formattedValue = formatPhoneNumber(e.target.value);
                    setPhoneNumber(formattedValue);
                    if (error) setError("");
                  }}
                  aria-invalid={!!error && (error.includes("phone") || error.includes("valid Philippine"))}
                  className={`bg-[#171717] border rounded-lg px-4 py-7 text-white flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !!error && (error.includes("phone") || error.includes("valid Philippine")) ? "border-red-500" : "border-[#404040]"
                  }`}
                  style={{ fontSize: "16px", height: "48px" }}
                  placeholder="9XX XXX XXXX"
                  maxLength={12}
                />
              </div>
            ) : (
              <Input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                aria-invalid={!!error && (error.includes("email") || error.includes("valid email"))}
                className={`bg-[#171717] border rounded-lg px-4 py-7 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !!error && (error.includes("email") || error.includes("valid email")) ? "border-red-500" : "border-[#404040]"
                }`}
                style={{ fontSize: "16px", height: "48px" }}
                placeholder="name@domain.com"
              />
            )}
    
          </div>

            <div className="flex items-center gap-4 mt-3 mb-1">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => {
              setAgreeToTerms(checked as boolean);
              if (error) setError("");
              }}
              className={`mt-[-5px] bg-[#414141] data-[state=checked]:bg-blue-500 w-4 h-4 rounded data-[state=checked]:text-white ${
                !!error && error.includes("agree to") ? "border border-red-500" : "border-none"
              }`}
              />
            <label htmlFor="terms" className="text-white text-[13.4px] leading-relaxed">
              I have read and I agree to the{' '}
              <button
              type="button"
              className="text-[#3B82F6] hover:text-blue-500 bg-transparent border-none cursor-pointer underline"
              >
              ResQWave Terms & Conditions
              </button>
              {' '}and{' '}
              <button
              type="button"
              className="text-[#3B82F6] hover:text-blue-500 bg-transparent border-none cursor-pointer underline"
              >
              Privacy Policy
              </button>
              .
            </label>
            </div>
            
            {/* Helper text for terms validation */}
            {error && error.includes("agree to") && (
              <p className="text-[#F92626] text-[13px] ml-8">
                Please agree to the Terms & Conditions and Privacy Policy to continue.
              </p>
            )}

          <Button
            type="submit"
            disabled={isLoading}
            className="text-white py-6 rounded-md font-medium text-base mt-2 flex items-center justify-center gap-2
             bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] 
             hover:from-[#2C64C5] hover:to-[#2C64C5]
             transition duration-300 cursor-pointer"
            style={{ opacity: isLoading ? 0.7 : 1 }}
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
            type="button"
            onClick={() => navigate('/login-focal')}
            className="text-[#BABABA] bg-transparent border-none cursor-pointer hover:text-white hover:bg-transparent mt-2"
          >
            Back
          </Button>
        </form>
      </main>
    </div>
  )
}