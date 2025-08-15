import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface TrendLineChartProps {
  data: Array<{
    date: string;
    orders: number;
    customers: number;
    revenue: number;
  }>;
}

const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--primary))",
  },
  customers: {
    label: "New Customers",
    color: "hsl(var(--primary-hover))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--accent))",
  },
};

export function TrendLineChart({ data }: TrendLineChartProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Business Trends</CardTitle>
        <p className="text-sm text-muted-foreground">30-day performance trends</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <LineChart data={data}>
            <defs>
              <linearGradient id="ordersGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              className="text-xs"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              className="text-xs"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ r: 4, fill: "hsl(var(--primary))" }}
              activeDot={{ 
                r: 6, 
                fill: "hsl(var(--primary))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2
              }}
              className="animate-[draw_2s_ease-in-out]"
            />
            <Line
              type="monotone"
              dataKey="customers"
              stroke="hsl(var(--primary-hover))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: "hsl(var(--primary-hover))" }}
              className="animate-[draw_2s_ease-in-out_0.5s]"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(var(--accent))" }}
              className="animate-[draw_2s_ease-in-out_1s]"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}