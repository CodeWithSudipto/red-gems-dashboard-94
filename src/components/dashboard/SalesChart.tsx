import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface SalesChartProps {
  data: Array<{
    month: string;
    sales: number;
    purchases: number;
  }>;
}

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
  purchases: {
    label: "Purchases", 
    color: "hsl(var(--primary-hover))",
  },
};

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-2 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Sales & Purchase Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="purchasesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary-hover))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary-hover))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
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
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#salesGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="purchases"
              stroke="hsl(var(--primary-hover))"
              fillOpacity={1}
              fill="url(#purchasesGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}