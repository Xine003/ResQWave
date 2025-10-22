import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { CircleAlert, Eye, EyeOff } from "lucide-react"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { HeaderOfficial } from "./components/HeaderOfficial"

export function LoginOfficial() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [ID, setID] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    try {
      const success = await login(ID, password)
      
      if (success) {
        setIsLoading(false)
        // Both admin and dispatcher need 2FA - go to verification
        navigate("/verification-official")
      } else {
        setError("Invalid credentials. Please check your ID and password.")
        setIsLoading(false)
      }
    } catch (error: any) {
      setError(error?.message || "An error occurred during login. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col primary-background" style={{ position: 'relative', overflow: 'hidden' }}>
      <HeaderOfficial />
      <div className="loginfocal-radial-gradient" />
      <main className="flex flex-1 flex-col items-center justify-center w-full" style={{ marginTop: '0px', zIndex: 20, position: 'relative' }}>
        <div className="flex flex-col items-center gap-4 mb-8">
          <h1 className="text-4xl font-semibold text-white mb-1">Sign in</h1>
          <p className="text-gray-300 text-center mb-2">
            Log in using your account credentials.<br />
            <span className="font-semibold mt-1 block">For dispatcher and admin use only.</span>
          </p>
        </div>
        {/* Error Alert UI */}
        {error && (
          <div className="flex items-center gap-5 bg-[#291415] border border-[#F92626] text-red-200 rounded-[5px] px-5 py-4 mb-4 animate-in fade-in w-full max-w-[490px] mx-auto">
            <CircleAlert className="text-[#F92626]" size={22} />
            <div>
              <span className="font-bold text-[#F92626]">{error.includes("credentials") ? "Wrong credentials" : "Login failed"}</span><br />
              <span className="text-[#F92626] text-[14px]">{error}</span>
            </div>
          </div>
        )}
        <form className="flex flex-col gap-4 w-full max-w-[490px]" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-white text-sm font-medium">ID</label>
            <Input
              id="username"
              type="text"
              required
              value={ID}
              onChange={e => {
                setID(e.target.value)
                if (error) setError("")
              }}
              aria-invalid={!!error}
              className={`bg-[#171717] rounded-[5px] px-5 py-5 text-white text-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border border-red-500" : "border border-[#333]"}`}
              style={{ fontSize: "16px", height: "56px" }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-white text-sm font-medium">Password</label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  if (error) setError("")
                }}
                aria-invalid={!!error}
                className={`bg-[#171717]  rounded-[5px] px-5 py-5 text-white text-4xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${error ? "border border-red-500" : "border border-[#333]"}`}
                style={{ fontSize: "16px", height: "56px" }}
              />
              <span
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={0}
                role="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </span>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="text-white py-6 rounded-[5px] font-medium text-base mt-2 hover:brightness-90 transition-all duration-200 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(0deg, #3B82F6 0%, #70A6FF 100%)', opacity: isLoading ? 0.7 : 1 }}
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
            onClick={() => navigate('/forgot-password-dispatcher')}
          >
            Forgot Password?
          </button>
        </div>
      </main>
    </div>
  )
}