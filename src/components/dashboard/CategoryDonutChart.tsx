import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, ResponsiveContainer, Cell } from 'recharts';

interface CategoryDonutChartProps {
  data: Array<{
    name: string;
    value: number;
    sales: number;
    color: string;
  }>;
}

const chartConfig = {
  electronics: {
    label: "Electronics",
    color: "hsl(var(--primary))",
  },
  clothing: {
    label: "Clothing",
    color: "hsl(var(--primary-hover))",
  },
  books: {
    label: "Books",
    color: "hsl(var(--accent))",
  },
  accessories: {
    label: "Accessories",
    color: "hsl(var(--muted))",
  },
};

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Top Categories</CardTitle>
        <p className="text-sm text-muted-foreground">Sales by product category</p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                className="animate-scale-in"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="hover:opacity-80 transition-all duration-300 hover:scale-105"
                    style={{
                      filter: "drop-shadow(0 4px 8px rgba(137, 0, 27, 0.1))"
                    }}
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name
                ]}
              />
            </PieChart>
          </ChartContainer>
          
          {/* Center Total */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center animate-fade-in">
              <div className="text-2xl font-bold text-primary">
                ${total.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Sales</div>
            </div>
          </div>
        </div>
        
        {/* Category List */}
        <div className="space-y-3 mt-6">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={item.name} className="flex items-center justify-between group hover:bg-muted/50 p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">${item.value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}