import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs-focal";
import { useState } from "react";
import { AlertTypeChart, RecentlyCompletedReports, ReportsTable } from "./components";

// Mock data for completed reports
const completedReports = [
  {
    emergencyId: "EMG-001",
    communityName: "PAMAKAI",
    alertType: "USER-INITIATED",
    dispatcher: "Bea Lugtu",
    dateTimeOccurred: "4:24:36 PM, August 17, 2025",
    accomplishedOn: "6:24:36 PM, August 17, 2025",
    address: "Block 1, Lot 17, Paraiso Rd, 1400"
  },
  {
    emergencyId: "EMG-009",
    communityName: "PAPASA",
    alertType: "USER-INITIATED",
    dispatcher: "Gwyneth Uy",
    dateTimeOccurred: "4:03:00 PM, August 16, 2025",
    accomplishedOn: "4:03:00 PM, August 16, 2025",
    address: "Block 3, Lot 20, Maligaya Rd, 1401"
  },
  {
    emergencyId: "EMG-008",
    communityName: "MASIPAG",
    alertType: "USER-INITIATED",
    dispatcher: "Rodel Sustiguer",
    dateTimeOccurred: "3:33:33 PM, August 16, 2025",
    accomplishedOn: "3:33:33 PM, August 16, 2025",
    address: "Block 2, Lot 21, Bundok Rd, 1410"
  },
  {
    emergencyId: "EMG-007",
    communityName: "MABAIT",
    alertType: "USER-INITIATED",
    dispatcher: "Kurt Cano",
    dateTimeOccurred: "3:12:48 PM, August 16, 2025",
    accomplishedOn: "3:12:48 PM, August 16, 2025",
    address: "Block 4, Lot 19, Nawawala Rd, 1409"
  },
  {
    emergencyId: "EMG-006",
    communityName: "UNO",
    alertType: "USER-INITIATED",
    dispatcher: "Bea Lugtu",
    dateTimeOccurred: "2:01:30 PM, August 16, 2025",
    accomplishedOn: "2:01:30 PM, August 16, 2025",
    address: "Block 3, Lot 15, Nagtatanim Rd, 1403"
  }
];

// Mock data for pending reports
const pendingReports = [
  {
    emergencyId: "EMG-010",
    communityName: "PAMAKAI",
    alertType: "USER-INITIATED",
    dispatcher: "Bea Lugtu",
    dateTimeOccurred: "4:24:36 PM, Wednesday",
    address: "Block 1, Lot 17, Paraiso Rd, 1400"
  }
];

// Recently completed reports data
const recentlyCompletedData = [
  {
    id: "EMG-001",
    title: "Report accomplished on August 17, 2025"
  }
];

export function Reports() {
  const [activeTab, setActiveTab] = useState("completed");

  return (
    <div 
      className="p-4 flex flex-col bg-[#171717] gap-1"
      style={{ height: "calc(100vh - 70px)", minHeight: "600px" }}
    >
      {/* Top section with charts - 40% of available height */}
      <div className="flex gap-6" style={{ height: "40%" }}>
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
      <Card className="flex flex-col gap-3 border-0" style={{ height: "60%" }}>
        <CardHeader className="flex-shrink-0 flex flex-row items-center gap-3">
          <CardTitle className="text-foreground text-2xl">Reports</CardTitle>
          <Tabs value={activeTab} defaultValue="completed" onValueChange={(v) => setActiveTab(v)}>
            <TabsList>
              <TabsTrigger
                value="completed"
                style={{
                  color: "#fff",
                  fontSize: "1rem",
                  padding: "0.5rem 1.5rem",
                  borderRadius: 4,
                  transition: "background 0.1s",
                  cursor: 'pointer'
                }}
                className="tab-trigger"
                onMouseEnter={e => (e.currentTarget.style.background = '#333333')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Completed
                <span style={{
                  marginLeft: "0.5rem",
                  padding: "0.125rem 0.5rem",
                  background: "#707070",
                  borderRadius: "0.25rem",
                  fontSize: "0.75rem"
                }}>
                  {completedReports.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                style={{
                  color: "#fff",
                  fontSize: "1rem",
                  padding: "0.5rem 1.5rem",
                  borderRadius: 4,
                  transition: "background 0.1s",
                  cursor: 'pointer'
                }}
                className="tab-trigger"
                onMouseEnter={e => (e.currentTarget.style.background = '#333333')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Pending
                <span style={{
                  marginLeft: "0.5rem",
                  padding: "0.125rem 0.5rem",
                  background: "#707070",
                  borderRadius: "0.25rem",
                  fontSize: "0.75rem"
                }}>
                  {pendingReports.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          {activeTab === "completed" ? (
            <ReportsTable 
              type="completed" 
              data={completedReports}
            />
          ) : (
            <ReportsTable 
              type="pending" 
              data={pendingReports}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}