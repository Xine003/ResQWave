import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartData = [
  { date: "Apr 15", userInitiated: 40, critical: 20 },
  { date: "Apr 20", userInitiated: 35, critical: 25 },
  { date: "Apr 25", userInitiated: 45, critical: 30 },
  { date: "Apr 30", userInitiated: 50, critical: 35 },
  { date: "May 5", userInitiated: 42, critical: 28 },
  { date: "May 10", userInitiated: 48, critical: 32 },
  { date: "May 15", userInitiated: 38, critical: 22 },
  { date: "May 20", userInitiated: 44, critical: 26 },
  { date: "May 25", userInitiated: 46, critical: 30 },
  { date: "May 30", userInitiated: 52, critical: 35 },
  { date: "Jun 4", userInitiated: 49, critical: 33 },
  { date: "Jun 9", userInitiated: 45, critical: 28 },
  { date: "Jun 14", userInitiated: 51, critical: 36 },
];

const chartConfig = {
  userInitiated: {
    label: "User-Initiated",
    color: "#FFA500",
  },
  critical: {
    label: "Critical",
    color: "#DC2626",
  },
} satisfies ChartConfig

export function AlertTypeChart() {
  const [timeRange, setTimeRange] = useState("Last 3 months");

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end flex-shrink-0 mb-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Last 3 months">Last 3 months</SelectItem>
            <SelectItem value="Last 6 months">Last 6 months</SelectItem>
            <SelectItem value="Last year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-full w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillUserInitiated" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-userInitiated)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-userInitiated)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillCritical" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-critical)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-critical)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="critical"
              type="natural"
              fill="url(#fillCritical)"
              stroke="var(--color-critical)"
              stackId="a"
            />
            <Area
              dataKey="userInitiated"
              type="natural"
              fill="url(#fillUserInitiated)"
              stroke="var(--color-userInitiated)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}