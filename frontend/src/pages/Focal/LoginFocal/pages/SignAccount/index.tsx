import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiFetch } from '@/lib/api';
import { FocalHeader } from '@/pages/Focal/LoginFocal/components/FocalHeader';
import { Eye, EyeOff, CircleAlert } from 'lucide-react';
import resqwave_logo from '/Landing/resqwave_logo.png';

export function LoginFocal() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !password) {
      setError("Please enter both ID and Password.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ message: string; tempToken?: string }>(
        '/focal/login',
        {
          method: 'POST',
          body: JSON.stringify({ emailOrNumber: id, password }),
        }
      );
      // Success: store tempToken for verification step
      let tempToken = res.tempToken || '';
      setIsLoading(false);
      navigate('/verification-signin-focal', { state: { tempToken } });
    } catch (err: any) {
      setIsLoading(false);
      // Try to parse error message from backend
      let msg = err?.message || 'Login failed';
      try {
        const parsed = JSON.parse(msg);
        msg = parsed.message || msg;
      } catch { }
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen flex flex-col primary-background" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="loginfocal-radial-gradient" />
      <FocalHeader />
      <main className="flex flex-1 flex-col items-center w-full" style={{ marginTop: '120px', zIndex: 20, position: 'relative' }}>
        <div className="flex flex-col items-center gap-4 mb-8">
          <h1 className="text-[43px] font-semibold text-white mb-1">Sign in</h1>
          <p className="text-[#BABABA] text-center text-base mb-2 leading-relaxed">
            Log in using your account credentials.<br />
            <span className="font-semibold mt-1 block">For focal person's use only.</span>
          </p>
        </div>
        {/* Error Alert UI */}
        {error && (
          <div className="flex items-center gap-5 bg-[#291415] border border-[#F92626] text-red-200 rounded-md px-5 py-4 mb-4 animate-in fade-in w-full max-w-[490px] mx-auto">
            <CircleAlert className="text-[#F92626]" size={22} />
            <div>
              <span className="font-bold text-[#F92626]">{error.includes("Wrong credentials") ? "Wrong credentials" : "Missing input"}</span><br />
              <span className="text-[#F92626] text-[14px]">{error}</span>
            </div>
          </div>
        )}
        <form className="flex flex-col gap-4 w-full max-w-[490px]" onSubmit={handleSubmit}>
          <label className="block text-white text-[15px] font-light">
            Email or Phone Number
          </label>
          <Input
            type="text"
            placeholder="ID"
            value={id}
            onChange={e => {
              setId(e.target.value);
              if (error) setError("");
            }}
            aria-invalid={!!error && (!id || error.includes("Wrong credentials"))}
            className="bg-[#171717] border border-[#404040] mb-1 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{ fontSize: "16px", height: "55px" }}
          />
          <div className="mb-3">
            <label className="block text-white text-[15px] font-light mb-3">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                aria-invalid={!!error && (!password || error.includes("Wrong credentials"))}
                className="bg-[#171717] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                style={{ fontSize: "16px", height: "55px" }}
              />
              <span
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={0}
                role="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{ zIndex: 2 }}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </span>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="text-white py-6 rounded-md font-medium text-base flex items-center justify-center gap-2
             bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] 
             hover:from-[#2C64C5] hover:to-[#2C64C5]
             transition duration-300 cursor-pointer mt-1"
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
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        <div className="text-center mt-4">
          <button
            className="text-[#A3A3A3] hover:text-[#929090] mt-2 text-md bg-transparent border-none cursor-pointer"
            onClick={() => navigate('forgot-password-focal')}
          >
            Forgot Password?
          </button>
        </div>
      </main>
    </div>
  )
}