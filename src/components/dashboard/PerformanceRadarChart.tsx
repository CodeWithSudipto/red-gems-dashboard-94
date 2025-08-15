import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface PerformanceRadarChartProps {
  data: Array<{
    metric: string;
    current: number;
    target: number;
    fullMark: number;
  }>;
}

const chartConfig = {
  current: {
    label: "Current Performance",
    color: "hsl(var(--primary))",
  },
  target: {
    label: "Target",
    color: "hsl(var(--primary-hover))",
  },
};

export function PerformanceRadarChart({ data }: PerformanceRadarChartProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Performance Radar</CardTitle>
        <p className="text-sm text-muted-foreground">Key performance indicators</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <RadarChart data={data}>
            <PolarGrid 
              stroke="hsl(var(--border))" 
              className="opacity-20"
            />
            <PolarAngleAxis 
              dataKey="metric" 
              className="text-xs fill-muted-foreground"
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              className="text-xs fill-muted-foreground"
              tick={false}
            />
            <Radar
              name="Target"
              dataKey="target"
              stroke="hsl(var(--primary-hover))"
              fill="hsl(var(--primary-hover))"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
              className="animate-[draw_2s_ease-in-out]"
            />
            <Radar
              name="Current"
              dataKey="current"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              strokeWidth={3}
              className="animate-[draw_2s_ease-in-out_0.5s]"
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number, name: string) => [
                `${value}%`,
                name
              ]}
            />
          </RadarChart>
        </ChartContainer>
        
        {/* Performance Summary */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {data.map((item, index) => {
            const achievement = ((item.current / item.target) * 100).toFixed(0);
            const isPositive = item.current >= item.target;
            
            return (
              <div key={item.metric} className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  {item.metric}
                </div>
                <div className={`text-lg font-bold ${isPositive ? 'text-success' : 'text-warning'}`}>
                  {achievement}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.current}% of {item.target}%
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}