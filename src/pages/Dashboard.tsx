import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Store, ShoppingCart, TrendingUp, Gift, Users } from 'lucide-react';
import { productRepository, storeRepository, purchaseRepository, saleRepository, productLocateRepository } from '@/data';

interface DashboardStats {
  totalProducts: number;
  inStock: number;
  totalStores: number;
  recentPurchases: number;
  recentSales: number;
  pendingRewards: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    inStock: 0,
    totalStores: 0,
    recentPurchases: 0,
    recentSales: 0,
    pendingRewards: 0,
  });
  const [loading, setLoading] = useState(true);

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
      
      setStats({
        totalProducts,
        inStock,
        totalStores,
        recentPurchases,
        recentSales,
        pendingRewards,
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'In Stock',
      value: stats.inStock.toLocaleString(),
      icon: Package,
      color: 'text-green-600',
    },
    {
      title: 'Total Stores',
      value: stats.totalStores.toLocaleString(),
      icon: Store,
      color: 'text-purple-600',
    },
    {
      title: 'Purchases (30d)',
      value: stats.recentPurchases.toLocaleString(),
      icon: ShoppingCart,
      color: 'text-orange-600',
    },
    {
      title: 'Sales (30d)',
      value: stats.recentSales.toLocaleString(),
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Pending Rewards',
      value: stats.pendingRewards.toLocaleString(),
      icon: Gift,
      color: 'text-red-600',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your admin panel"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/products"
              className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="font-medium">Manage Products</div>
              <div className="text-sm text-muted-foreground">Add, edit, or view products</div>
            </a>
            <a
              href="/purchases"
              className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="font-medium">Record Purchase</div>
              <div className="text-sm text-muted-foreground">Add new product purchases</div>
            </a>
            <a
              href="/sales"
              className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="font-medium">Record Sale</div>
              <div className="text-sm text-muted-foreground">Process product sales</div>
            </a>
            <a
              href="/rewards"
              className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="font-medium">Generate Rewards</div>
              <div className="text-sm text-muted-foreground">Process reward assignments</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Data Storage</span>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Mock Repository</span>
              <span className="text-sm text-green-600 font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">UI State</span>
              <span className="text-sm text-green-600 font-medium">Loaded</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Local Storage</span>
              <span className="text-sm text-green-600 font-medium">Available</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}