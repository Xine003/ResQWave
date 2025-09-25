import type React from "react"
import { useLocation } from "react-router-dom"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

interface officialLayoutProps {
  children: React.ReactNode
}

export function OfficialLayout({ children }: officialLayoutProps) {
  const location = useLocation();
  // Visualization nav is open if path starts with /visualization or /tabular
  const isVisualizationOpen = location.pathname.startsWith("/visualization") || location.pathname.startsWith("/tabular");
  return (
    <div className="min-h-screen bg-background dark">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header isVisualizationOpen={isVisualizationOpen} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
