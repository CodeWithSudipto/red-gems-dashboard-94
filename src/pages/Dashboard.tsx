import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { productRepository, storeRepository, purchaseRepository, saleRepository, productLocateRepository } from '@/data';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { PartnerLeaderboard } from '@/components/dashboard/PartnerLeaderboard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';

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