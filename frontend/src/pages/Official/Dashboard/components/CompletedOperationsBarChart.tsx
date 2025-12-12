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

export function CompletedOperationsBarChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchCompletedOperationsStats("monthly");
        const formattedData = Object.entries(response.stats).map(([date, values]) => ({
          date,
          userInitiated: values.userInitiated,
          critical: values.critical,
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching alert stats:", error);
      }
    };

    loadData();
  }, []);
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
