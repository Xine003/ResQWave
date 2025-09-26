import type React from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

interface officialLayoutProps {
  children: React.ReactNode
}

export function OfficialLayout({ children }: officialLayoutProps) {
  return (
    <div className="min-h-screen bg-background dark">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
