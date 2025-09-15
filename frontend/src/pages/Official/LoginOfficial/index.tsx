import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function LoginOfficial() {
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#171717] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#171717]"></div>

      {/* Login form */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">

          <h1 className="text-white text-3xl font-semibold mb-2">Sign in</h1>
          <p className="text-white text-sm px-3 py-1 inline-block">
            Log in using your account credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              id="username"
              type="text"
              placeholder="Username"
              required
              className="w-full bg-[#171717] border-gray-100 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 h-12"
            />
          </div>

          <div className="relative">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              required
              className="w-full bg-[#171717] border-gray-100 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 h-12 pr-10"
            />
            <Button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 rounded-sm mt-6"
          >
            Sign In
          </Button>
        </form>

        <div className="text-center mt-6">
          <a href="#" className="text-gray-400 text-sm hover:text-gray-300 hover:underline">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  )
}
