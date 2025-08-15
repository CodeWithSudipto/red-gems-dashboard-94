import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { productRepository, storeRepository, purchaseRepository, saleRepository, productLocateRepository } from '@/data';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { PartnerLeaderboard } from '@/components/dashboard/PartnerLeaderboard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { InventoryPieChart } from '@/components/dashboard/InventoryPieChart';
import { TrendLineChart } from '@/components/dashboard/TrendLineChart';
import { CategoryDonutChart } from '@/components/dashboard/CategoryDonutChart';
import { PerformanceRadarChart } from '@/components/dashboard/PerformanceRadarChart';

interface DashboardStats {
  totalProducts: number;
  inStock: number;
  totalStores: number;
  recentPurchases: number;
  recentSales: number;
  pendingRewards: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    inStock: 0,
    totalStores: 0,
    recentPurchases: 0,
    recentSales: 0,
    pendingRewards: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  // Mock data for charts
  const salesData = [
    { month: 'Jan', sales: 4000, purchases: 2400 },
    { month: 'Feb', sales: 3000, purchases: 1398 },
    { month: 'Mar', sales: 2000, purchases: 9800 },
    { month: 'Apr', sales: 2780, purchases: 3908 },
    { month: 'May', sales: 1890, purchases: 4800 },
    { month: 'Jun', sales: 2390, purchases: 3800 },
  ];

  const revenueData = [
    { category: 'Products', revenue: 12000, target: 15000 },
    { category: 'Services', revenue: 8500, target: 10000 },
    { category: 'Subscriptions', revenue: 5200, target: 6000 },
    { category: 'Accessories', revenue: 3100, target: 4000 },
  ];

  const partnersData = [
    { id: '1', name: 'TechCorp Solutions', sales: 125000, growth: 15.2, rank: 1 },
    { id: '2', name: 'Global Industries', sales: 98000, growth: 8.7, rank: 2 },
    { id: '3', name: 'Innovation Labs', sales: 87500, growth: 12.1, rank: 3 },
    { id: '4', name: 'Digital Dynamics', sales: 76200, growth: -2.3, rank: 4 },
    { id: '5', name: 'Future Systems', sales: 68900, growth: 5.8, rank: 5 },
    { id: '6', name: 'Smart Solutions', sales: 61400, growth: 9.2, rank: 6 },
    { id: '7', name: 'NextGen Corp', sales: 55300, growth: 3.4, rank: 7 },
    { id: '8', name: 'Apex Partners', sales: 48700, growth: -1.1, rank: 8 },
  ];

  // Inventory distribution data
  const inventoryData = [
    { category: 'In Stock', value: 245, percentage: 68 },
    { category: 'Low Stock', value: 67, percentage: 19 },
    { category: 'Out of Stock', value: 32, percentage: 9 },
    { category: 'Discontinued', value: 16, percentage: 4 },
  ];

  // Trend data for line chart
  const trendData = [
    { date: 'Jan 1', orders: 45, customers: 12, revenue: 4500 },
    { date: 'Jan 8', orders: 52, customers: 18, revenue: 5200 },
    { date: 'Jan 15', orders: 38, customers: 9, revenue: 3800 },
    { date: 'Jan 22', orders: 67, customers: 24, revenue: 6700 },
    { date: 'Jan 29', orders: 71, customers: 21, revenue: 7100 },
    { date: 'Feb 5', orders: 59, customers: 16, revenue: 5900 },
    { date: 'Feb 12', orders: 84, customers: 31, revenue: 8400 },
  ];

  // Category sales data
  const categoryData = [
    { name: 'Electronics', value: 45000, sales: 156, color: 'hsl(var(--primary))' },
    { name: 'Clothing', value: 32000, sales: 124, color: 'hsl(var(--primary-hover))' },
    { name: 'Books', value: 18000, sales: 89, color: 'hsl(var(--accent))' },
    { name: 'Accessories', value: 12000, sales: 67, color: 'hsl(var(--muted))' },
  ];

  // Performance radar data
  const performanceData = [
    { metric: 'Sales', current: 85, target: 90, fullMark: 100 },
    { metric: 'Quality', current: 92, target: 85, fullMark: 100 },
    { metric: 'Delivery', current: 78, target: 80, fullMark: 100 },
    { metric: 'Support', current: 95, target: 90, fullMark: 100 },
    { metric: 'Growth', current: 73, target: 75, fullMark: 100 },
    { metric: 'Retention', current: 88, target: 85, fullMark: 100 },
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get products stats
      const products = await productRepository.list({ limit: 1000 });
      const totalProducts = products.total;
      const inStock = products.data.filter(p => p.stock > 0).length;
      
      // Get stores count
      const stores = await storeRepository.list({ limit: 1 });
      const totalStores = stores.total;
      
      // Get recent purchases (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const purchases = await purchaseRepository.list({ limit: 1000 });
      const recentPurchases = purchases.data.filter(p => 
        new Date(p.purchaseDate) >= thirtyDaysAgo
      ).length;
      
      // Get recent sales (last 30 days)
      const sales = await saleRepository.list({ limit: 1000 });
      const recentSales = sales.data.filter(s => 
        new Date(s.saleDate) >= thirtyDaysAgo
      ).length;
      
      // Get pending rewards
      const productLocate = await productLocateRepository.list({ 
        limit: 1000,
        filters: { rewardStatus: false }
      });
      const pendingRewards = productLocate.total;

      // Calculate additional metrics
      const totalRevenue = sales.data.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const averageOrderValue = recentSales > 0 ? totalRevenue / recentSales : 0;
      const conversionRate = totalProducts > 0 ? (recentSales / totalProducts) * 100 : 0;
      
      setStats({
        totalProducts,
        inStock,
        totalStores,
        recentPurchases,
        recentSales,
        pendingRewards,
        totalRevenue,
        averageOrderValue,
        conversionRate,
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <PageHeader
        title="Analytics Dashboard"
        description="Real-time insights and performance metrics"
      />

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6 mb-8">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          change="+12% from last month"
          changeType="positive"
          loading={loading}
          className="lg:col-span-1"
        />
        <StatsCard
          title="In Stock"
          value={stats.inStock.toLocaleString()}
          change="+8% from last month" 
          changeType="positive"
          loading={loading}
          className="lg:col-span-1"
        />
        <StatsCard
          title="Total Stores"
          value={stats.totalStores.toLocaleString()}
          change="No change"
          changeType="neutral"
          loading={loading}
          className="lg:col-span-1"
        />
        <StatsCard
          title="Revenue (30d)"
          value={`$${(stats.totalRevenue / 1000).toFixed(1)}K`}
          change="+15% from last month"
          changeType="positive"
          loading={loading}
          className="lg:col-span-1"
        />
        <StatsCard
          title="Avg Order Value"
          value={`$${stats.averageOrderValue.toFixed(0)}`}
          change="+5% from last month"
          changeType="positive"
          loading={loading}
          className="lg:col-span-1"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats.conversionRate.toFixed(1)}%`}
          change="-2% from last month"
          changeType="negative"
          loading={loading}
          className="lg:col-span-1"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <SalesChart data={salesData} />
        </div>
        <RevenueChart data={revenueData} />
      </div>

      {/* Additional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <InventoryPieChart data={inventoryData} />
        </div>
        <div className="lg:col-span-1">
          <CategoryDonutChart data={categoryData} />
        </div>
        <div className="xl:col-span-2">
          <TrendLineChart data={trendData} />
        </div>
      </div>

      {/* Performance and Advanced Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <PerformanceRadarChart data={performanceData} />
        
        {/* Advanced Metrics Card */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Advanced Metrics</CardTitle>
            <p className="text-sm text-muted-foreground">Real-time business insights</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Lifetime Value */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Customer Lifetime Value</span>
                <span className="text-lg font-bold text-primary">$2,450</span>
              </div>
              <div className="w-full bg-primary/20 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-3/4 animate-[expand_1s_ease-out]"></div>
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">+12% from last quarter</span>
            </div>

            {/* Churn Rate */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Churn Rate</span>
                <span className="text-lg font-bold text-warning">3.2%</span>
              </div>
              <div className="w-full bg-warning/20 rounded-full h-2">
                <div className="bg-warning h-2 rounded-full w-1/4 animate-[expand_1s_ease-out_0.5s]"></div>
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">-0.8% from last quarter</span>
            </div>

            {/* Market Share */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-success/10 to-success/5 border border-success/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Market Share</span>
                <span className="text-lg font-bold text-success">18.7%</span>
              </div>
              <div className="w-full bg-success/20 rounded-full h-2">
                <div className="bg-success h-2 rounded-full w-4/5 animate-[expand_1s_ease-out_1s]"></div>
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">+2.3% from last quarter</span>
            </div>

            {/* Profit Margin */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Profit Margin</span>
                <span className="text-lg font-bold text-accent">24.5%</span>
              </div>
              <div className="w-full bg-accent/20 rounded-full h-2">
                <div className="bg-accent h-2 rounded-full w-2/3 animate-[expand_1s_ease-out_1.5s]"></div>
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">+1.2% from last quarter</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partner Leaderboard and Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <PartnerLeaderboard partners={partnersData} loading={loading} />
        </div>
        
        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/products"
                className="block p-4 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all duration-300 group"
              >
                <div className="font-medium group-hover:text-primary transition-colors">Manage Products</div>
                <div className="text-sm text-muted-foreground">Add, edit, or view products</div>
              </a>
              <a
                href="/purchases"
                className="block p-4 rounded-lg bg-muted/50 border hover:bg-muted transition-all duration-300 group"
              >
                <div className="font-medium group-hover:text-primary transition-colors">Record Purchase</div>
                <div className="text-sm text-muted-foreground">Add new product purchases</div>
              </a>
              <a
                href="/sales"
                className="block p-4 rounded-lg bg-muted/50 border hover:bg-muted transition-all duration-300 group"
              >
                <div className="font-medium group-hover:text-primary transition-colors">Record Sale</div>
                <div className="text-sm text-muted-foreground">Process product sales</div>
              </a>
              <a
                href="/rewards"
                className="block p-4 rounded-lg bg-muted/50 border hover:bg-muted transition-all duration-300 group"
              >
                <div className="font-medium group-hover:text-primary transition-colors">Generate Rewards</div>
                <div className="text-sm text-muted-foreground">Process reward assignments</div>
              </a>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-card rounded-lg border p-6 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Storage</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm font-medium text-success">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Services</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm font-medium text-success">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cache Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span className="text-sm font-medium text-warning">Optimizing</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Security</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm font-medium text-success">Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}