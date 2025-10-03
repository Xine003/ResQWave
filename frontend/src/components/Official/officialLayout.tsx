import { LiveReportProvider, useLiveReport } from "@/components/Official/LiveReportContext"
import type React from "react"
import { useLocation } from "react-router-dom"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"

interface officialLayoutProps {
  children: React.ReactNode
}

function OfficialLayoutContent({ children }: officialLayoutProps) {
  const location = useLocation();
  const { isLiveReportOpen } = useLiveReport();
  
  // Visualization nav is open if path starts with /visualization or /tabular
  const isVisualizationOpen = location.pathname.startsWith("/visualization") || location.pathname.startsWith("/tabular");
  
  return (
    <div className="min-h-screen bg-background dark">
      <div className="flex">
        <Sidebar />
        <div 
          className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
          style={{
            marginRight: isLiveReportOpen && isVisualizationOpen ? '400px' : '0'
          }}
        >
          <Header isVisualizationOpen={isVisualizationOpen} isLiveReportOpen={isLiveReportOpen} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function OfficialLayout({ children }: officialLayoutProps) {
  return (
    <LiveReportProvider>
      <OfficialLayoutContent>{children}</OfficialLayoutContent>
    </LiveReportProvider>
  );
}
