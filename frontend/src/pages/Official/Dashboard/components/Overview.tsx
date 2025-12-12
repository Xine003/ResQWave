import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Calendar, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCompletedOperationsStats } from "../api/adminDashboard";
import {
  CompletedOperationsBarChart,
  CompletedOperationsLineChart,
  CompletedOperationsPieChart,
  StatisticsCards,
} from "./index";

type ChartType = "bar" | "line" | "pie";

export function Overview() {
  const [activeChart, setActiveChart] = useState<ChartType>("bar");
  const [userInitiatedCount, setUserInitiatedCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);

  useEffect(() => {
    const loadLegendData = async () => {
      try {
        const response = await fetchCompletedOperationsStats("monthly");
        
        // Calculate totals from all time periods
        let totalUserInitiated = 0;
        let totalCritical = 0;
        
        Object.values(response.stats).forEach((values) => {
          totalUserInitiated += values.userInitiated;
          totalCritical += values.critical;
        });
        
        setUserInitiatedCount(totalUserInitiated);
        setCriticalCount(totalCritical);
      } catch (error) {
        console.error("Error fetching legend data:", error);
      }
    };

    loadLegendData();
  }, []);

  return (
    <div className="p-5 py-4 flex flex-col bg-[#171717] gap-4 h-[calc(100vh-73px)] max-h-[calc(100vh-73px)] overflow-hidden">
      {/* Statistics Cards Section */}
      <div className="shrink-0">
        <StatisticsCards />
      </div>

      {/* Chart Section - 90% of viewport height */}
      <div className="flex-1 min-h-0">
        <Card className="border-border p-0 h-full flex flex-col rounded-[5px]" style={{ backgroundColor: "#211f1f" }}>
          {/* Top Row - Chart Controls */}
          <div className="flex items-center justify-between p-3 border-b mb-0">
            {/* Left side - Chart Type Tabs */}
            <div className="flex items-center gap-0.5 rounded-[5px] bg-[#2a2a2a] p-0.5">
              <button
                onClick={() => setActiveChart("bar")}
                className={`px-4 py-1.5 rounded-[5px] text-sm font-medium transition-colors ${
                  activeChart === "bar"
                    ? "bg-[#404040] text-white"
                    : "text-white/60 hover:text-white hover:bg-[#333333]"
                }`}
              >
                Bar Chart
              </button>
              <button
                onClick={() => setActiveChart("line")}
                className={`px-4 py-1.5 rounded-[5px] text-sm font-medium transition-colors ${
                  activeChart === "line"
                    ? "bg-[#404040] text-white"
                    : "text-white/60 hover:text-white hover:bg-[#333333]"
                }`}
              >
                Line Chart
              </button>
              <button
                onClick={() => setActiveChart("pie")}
                className={`px-4 py-1.5 rounded-[5px] text-sm font-medium transition-colors ${
                  activeChart === "pie"
                    ? "bg-[#404040] text-white"
                    : "text-white/60 hover:text-white hover:bg-[#333333]"
                }`}
              >
                Pie Chart
              </button>
            </div>

            {/* Right side - Download and Date */}
            <div className="flex items-center gap-2">
              {/* Download Button - Icon Only */}
              <button 
                className="flex items-center justify-center p-2 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded-[5px] transition-colors"
                title="Download chart"
                aria-label="Download chart"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Date Range Selector */}
              <button className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded-[5px] transition-colors">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">14 August 2025 - 25 November 2025</span>
              </button>
            </div>
          </div>

          {/* Title and Legend Row */}
          <div className="flex items-center justify-between p-4 pt-0 border-b">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-foreground text-2xl">
                Completed Operations
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                A breakdown of user-initiated and critical alerts from completed rescue operations
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4">
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 bg-[#FFA500] mt-1"></div>
                <div className="flex flex-col items-center">
                  <span className="text-white text-sm">User-initiated</span>
                  <span className="text-white text-lg font-bold">{userInitiatedCount}</span>
                </div>
              </div>
              {/* Vertical Divider */}
              <div className="h-12 w-px bg-[#404040]"></div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 bg-[#DC2626] mt-1"></div>
                <div className="flex flex-col items-center">
                  <span className="text-white text-sm">Critical</span>
                  <span className="text-white text-lg font-bold">{criticalCount}</span>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="flex-1 flex flex-col min-h-0 pl-0 pr-10 pt-0">
          <div className="w-full h-full">
            {activeChart === "bar" && <CompletedOperationsBarChart />}
            {activeChart === "line" && <CompletedOperationsLineChart />}
            {activeChart === "pie" && <CompletedOperationsPieChart />}
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
