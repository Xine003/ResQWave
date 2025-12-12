import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Cell, Label, Pie, PieChart } from "recharts";

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

// Static data matching the prototype image totals
const chartData = [
  { name: "userInitiated", value: 81, fill: "var(--color-userInitiated)" },
  { name: "critical", value: 19, fill: "var(--color-critical)" },
];

const totalOperations = chartData.reduce((acc, curr) => acc + curr.value, 0);

export function CompletedOperationsPieChart() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <ChartContainer
        config={chartConfig}
        className="h-full w-full max-h-[400px]"
      >
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={80}
            outerRadius={120}
            strokeWidth={0}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-white text-4xl font-bold"
                      >
                        {totalOperations}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 28}
                        className="fill-white/60 text-sm"
                      >
                        Total
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}
