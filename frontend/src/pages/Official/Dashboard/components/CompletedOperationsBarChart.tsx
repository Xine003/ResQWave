import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

interface ChartData {
  date: string;
  userInitiated: number;
  critical: number;
}

interface CompletedOperationsBarChartProps {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export function CompletedOperationsBarChart({ dateRange }: CompletedOperationsBarChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Calculate the difference in days
        const daysDiff = Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Use daily granularity if range is 31 days or less, otherwise monthly
        const granularity = daysDiff <= 31 ? "daily" : "monthly";
        
        const response = await fetchCompletedOperationsStats(granularity);
        
        // Filter data to only include dates within the selected range
        const filteredData = Object.entries(response.stats)
          .filter(([date]) => {
            const entryDate = new Date(date);
            const startOfDay = new Date(dateRange.startDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dateRange.endDate);
            endOfDay.setHours(23, 59, 59, 999);
            return entryDate >= startOfDay && entryDate <= endOfDay;
          })
          .map(([date, values]) => ({
            date,
            userInitiated: values.userInitiated,
            critical: values.critical,
          }));
        
        setChartData(filteredData);
      } catch (error) {
        console.error("Error fetching alert stats:", error);
      }
    };

    loadData();
  }, [dateRange]);
  return (
    <div className="h-full w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "#888" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "#888" }}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar
            dataKey="userInitiated"
            fill="var(--color-userInitiated)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="critical"
            fill="var(--color-critical)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
