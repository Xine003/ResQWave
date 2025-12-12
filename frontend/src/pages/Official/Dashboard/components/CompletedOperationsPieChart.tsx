import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { Pie, PieChart } from "recharts";
import { fetchCompletedOperationsStats } from "../api/adminDashboard";

const chartConfig = {
  userInitiated: {
    label: "User-initiated",
    color: "#FFA500",
  },
  critical: {
    label: "Critical",
    color: "#DC2626",
  },
} satisfies ChartConfig;

interface PieChartData {
  name: string;
  value: number;
  fill: string;
  [key: string]: string | number;
}

export function CompletedOperationsPieChart() {
  const [chartData, setChartData] = useState<PieChartData[]>([
    { name: "userInitiated", value: 0, fill: "var(--color-userInitiated)" },
    { name: "critical", value: 0, fill: "var(--color-critical)" },
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchCompletedOperationsStats("monthly");
        
        // Calculate totals from all time periods
        let totalUserInitiated = 0;
        let totalCritical = 0;
        
        Object.values(response.stats).forEach((values) => {
          totalUserInitiated += values.userInitiated;
          totalCritical += values.critical;
        });
        
        const data = [
          { name: "userInitiated", value: totalUserInitiated, fill: "var(--color-userInitiated)" },
          { name: "critical", value: totalCritical, fill: "var(--color-critical)" },
        ];
        
        setChartData(data);
      } catch (error) {
        console.error("Error fetching completed operations stats:", error);
      }
    };

    loadData();
  }, []);
  return (
    <div className="h-full w-full flex items-center justify-center">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full max-w-[400px]"
      >
        <PieChart width={400} height={400}>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie 
            data={chartData} 
            dataKey="value" 
            nameKey="name"
            label
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#8884d8"
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
