import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  loading?: boolean;
  className?: string;
}

export function StatsCard({ title, value, change, changeType = 'neutral', loading, className }: StatsCardProps) {
  return (
    <Card className={cn("hover:shadow-lg transition-all duration-300 animate-fade-in", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-bold tracking-tight">
          {loading ? (
            <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          ) : (
            value
          )}
        </div>
        {change && !loading && (
          <div className={cn(
            "text-xs font-medium flex items-center gap-1",
            changeType === 'positive' && "text-success",
            changeType === 'negative' && "text-destructive",
            changeType === 'neutral' && "text-muted-foreground"
          )}>
            {changeType === 'positive' && "↗"}
            {changeType === 'negative' && "↘"}
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  );
}