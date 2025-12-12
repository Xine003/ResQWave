import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

// Static data matching the prototype image
const chartData = [
  { date: "Apr 4", userInitiated: 8, critical: 10 },
  { date: "Apr 9", userInitiated: 12, critical: 15 },
  { date: "Apr 15", userInitiated: 15, critical: 8 },
  { date: "Apr 21", userInitiated: 13, critical: 10 },
  { date: "Apr 27", userInitiated: 11, critical: 12 },
  { date: "May 3", userInitiated: 10, critical: 14 },
  { date: "May 9", userInitiated: 18, critical: 12 },
  { date: "May 15", userInitiated: 14, critical: 20 },
  { date: "May 21", userInitiated: 16, critical: 14 },
  { date: "May 27", userInitiated: 15, critical: 16 },
  { date: "Jun 2", userInitiated: 17, critical: 17 },
  { date: "Jun 7", userInitiated: 10, critical: 19 },
  { date: "Jun 12", userInitiated: 12, critical: 11 },
  { date: "Jun 18", userInitiated: 22, critical: 24 },
  { date: "Jun 24", userInitiated: 19, critical: 26 },
  { date: "Jun 30", userInitiated: 20, critical: 15 },
];

export function CompletedOperationsBarChart() {
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
