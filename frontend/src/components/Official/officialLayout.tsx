import { LiveReportProvider, useLiveReport } from "@/components/Official/LiveReportContext"
import { useAuth } from "@/contexts/AuthContext"
import type React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { Header } from "./header"
import Sidebar from "./sidebar"

interface officialLayoutProps {
  children: React.ReactNode
}

function OfficialLayoutContent({ children }: officialLayoutProps) {
  const location = useLocation();
  const { isLiveReportOpen } = useLiveReport();
  
  // Get auth state
  let isLoading = false;
  let user = null;
  try {
    const auth = useAuth();
    isLoading = auth.isLoading;
    user = auth.user;
  } catch {
    // Outside provider, check localStorage
    const storedToken = localStorage.getItem('resqwave_token');
    const storedUser = localStorage.getItem('resqwave_user');
    if (storedUser && storedToken) {
      try {
        user = JSON.parse(storedUser);
      } catch {
        user = null;
      }
    }
  }

  // Show loading state while validating token
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#171717]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in after loading, redirect to login
  if (!user) {
    return <Navigate to="/login-official" replace />;
  }

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
