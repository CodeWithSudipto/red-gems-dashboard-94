import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Partner {
  id: string;
  name: string;
  sales: number;
  growth: number;
  rank: number;
}

interface PartnerLeaderboardProps {
  partners: Partner[];
  loading?: boolean;
}

export function PartnerLeaderboard({ partners, loading }: PartnerLeaderboardProps) {
  const maxSales = Math.max(...partners.map(p => p.sales));

  if (loading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Partner Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-2 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Partner Leaderboard</CardTitle>
        <p className="text-sm text-muted-foreground">Top performing partners this month</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {partners.slice(0, 10).map((partner, index) => (
          <div 
            key={partner.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-all duration-300 hover:bg-muted/50",
              index < 3 && "bg-primary/5 border border-primary/20"
            )}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                index === 0 && "bg-yellow-100 text-yellow-800",
                index === 1 && "bg-gray-100 text-gray-800", 
                index === 2 && "bg-orange-100 text-orange-800",
                index > 2 && "bg-muted text-muted-foreground"
              )}>
                {partner.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{partner.name}</div>
                <div className="text-sm text-muted-foreground">
                  ${partner.sales.toLocaleString()} sales
                </div>
                <Progress 
                  value={(partner.sales / maxSales) * 100} 
                  className="h-2 mt-1"
                />
              </div>
              <div className={cn(
                "text-right",
                partner.growth > 0 ? "text-success" : partner.growth < 0 ? "text-destructive" : "text-muted-foreground"
              )}>
                <div className="text-sm font-medium">
                  {partner.growth > 0 ? "+" : ""}{partner.growth}%
                </div>
                <div className="text-xs text-muted-foreground">growth</div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}