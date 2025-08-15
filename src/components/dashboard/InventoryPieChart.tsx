import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, ResponsiveContainer, Cell } from 'recharts';

interface InventoryPieChartProps {
  data: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
}

const chartConfig = {
  inStock: {
    label: "In Stock",
    color: "hsl(var(--primary))",
  },
  lowStock: {
    label: "Low Stock", 
    color: "hsl(var(--warning))",
  },
  outOfStock: {
    label: "Out of Stock",
    color: "hsl(var(--destructive))",
  },
  discontinued: {
    label: "Discontinued",
    color: "hsl(var(--muted))",
  },
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--warning))", 
  "hsl(var(--destructive))",
  "hsl(var(--muted))"
];

export function InventoryPieChart({ data }: InventoryPieChartProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Inventory Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">Stock status overview</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              className="animate-scale-in"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity duration-300"
                />
              ))}
            </Pie>
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value: number, name: string) => [
                `${value} items (${data.find(d => d.category === name)?.percentage}%)`,
                name
              ]}
            />
          </PieChart>
        </ChartContainer>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {data.map((item, index) => (
            <div key={item.category} className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{item.category}</div>
                <div className="text-xs text-muted-foreground">
                  {item.value} items ({item.percentage}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}