import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs-focal";
import { useState } from "react";
import { AlertTypeChart, RecentlyCompletedReports, ReportsTable } from "./components";
import { useReports } from "./hooks/useReports";

// Recently completed reports data
const recentlyCompletedData = [
  {
    id: "EMG-001",
    title: "Report accomplished on August 17, 2025"
  }
];

export function Reports() {
  const [activeTab, setActiveTab] = useState("completed");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { 
    pendingReports, 
    completedReports, 
    loading, 
    error,
    refreshAllReports
  } = useReports();


  return (
    <div 
      className="p-4 flex flex-col bg-[#171717] gap-1 h-[calc(100vh-70px)] min-h-[600px]"
    >
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="text-white">Loading reports...</div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-center h-32">
          <div className="text-red-400">Error: {error}</div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Top section with charts - 40% of available height */}
          <div className="flex gap-6 h-[40%]">
            {/* Alert Type Chart - 75% width */}
            <Card className="border-border flex-[3] flex flex-col" style={{ backgroundColor: "#211f1f" }}>
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-foreground">Alert Type</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Showing user-initiated and critical alerts from the last 3 months
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <AlertTypeChart />
              </CardContent>
            </Card>

            {/* Recently Completed Reports - 25% width */}
            <Card className="border-border flex-1 flex flex-col" style={{ backgroundColor: "#211f1f" }}>
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-foreground">Recently Completed Reports</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <RecentlyCompletedReports reports={recentlyCompletedData} />
              </CardContent>
            </Card>
          </div>

          {/* Reports Table - 60% of available height */}
          <Card className="flex flex-col gap-3 border-0 h-[60%]">
            <CardHeader className="flex-shrink-0 flex flex-row items-center gap-3">
              <CardTitle className="text-foreground text-2xl">Reports</CardTitle>
              <div className="flex items-center gap-3">
                <Tabs value={activeTab} defaultValue="completed" onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger
                      value="completed"
                      className="text-white text-base px-6 py-2 rounded transition-colors cursor-pointer hover:bg-[#333333]"
                    >
                      Completed
                      <span className="ml-2 px-2 py-0.5 bg-[#707070] rounded text-xs">
                        {completedReports.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="pending"
                      className="text-white text-base px-6 py-2 rounded transition-colors cursor-pointer hover:bg-[#333333]"
                    >
                      Pending
                      <span className="ml-2 px-2 py-0.5 bg-[#707070] rounded text-xs">
                        {pendingReports.length}
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              {activeTab === "completed" ? (
                <ReportsTable 
                  type="completed" 
                  data={completedReports}
                  onReportCreated={refreshAllReports}
                />
              ) : (
                <ReportsTable 
                  type="pending" 
                  data={pendingReports}
                  onReportCreated={refreshAllReports}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}