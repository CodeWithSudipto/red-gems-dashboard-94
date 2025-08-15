import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productLocateRepository, productRepository, storeRepository, customerRepository } from '@/data';
import { ProductLocate, Product, Store, Customer } from '@/types/entities';
import { useUIStore } from '@/store';
import { formatDate } from '@/utils';

export default function ProductLocatePage() {
  const [productLocates, setProductLocates] = useState<ProductLocate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    productId: 'all',
    storeId: 'all',
    saleStatus: 'all',
    rewardStatus: 'all',
  });
  const { addToast } = useUIStore();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadFilteredData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResult, storesResult, customersResult] = await Promise.all([
        productRepository.list({ limit: 1000 }),
        storeRepository.list({ limit: 1000 }),
        customerRepository.list({ limit: 1000 })
      ]);
      setProducts(productsResult.data);
      setStores(storesResult.data);
      setCustomers(customersResult.data);
      await loadFilteredData();
    } catch (error) {
      addToast({ message: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadFilteredData = async () => {
    try {
      const queryFilters: any = {};
      
      if (filters.productId && filters.productId !== 'all') queryFilters.productId = filters.productId;
      if (filters.storeId && filters.storeId !== 'all') queryFilters.storeId = filters.storeId;
      if (filters.saleStatus !== '' && filters.saleStatus !== 'all') queryFilters.saleStatus = filters.saleStatus === 'true';
      if (filters.rewardStatus !== '' && filters.rewardStatus !== 'all') queryFilters.rewardStatus = filters.rewardStatus === 'true';

      const result = await productLocateRepository.list({ 
        limit: 1000,
        filters: queryFilters
      });
      setProductLocates(result.data);
    } catch (error) {
      addToast({ message: 'Failed to load product locations', type: 'error' });
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const getStoreName = (storeId?: string) => {
    if (!storeId) return 'No Store';
    const store = stores.find(s => s.id === storeId);
    return store?.name || 'Unknown Store';
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'No Customer';
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const columns = [
    { key: 'productId', label: 'Product', render: (value: string) => getProductName(value) },
    { key: 'storeId', label: 'Store Location', render: (value?: string) => getStoreName(value) },
    { key: 'customerId', label: 'Customer', render: (value?: string) => getCustomerName(value) },
    { 
      key: 'saleStatus', 
      label: 'Sale Status', 
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Sold' : 'Available'}
        </Badge>
      )
    },
    { 
      key: 'rewardStatus', 
      label: 'Reward Status', 
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'outline'}>
          {value ? 'Claimed' : 'Pending'}
        </Badge>
      )
    },
    { key: 'uniqueKey', label: 'Unique Key' },
    { key: 'createdAt', label: 'Created', render: (value: string) => formatDate(value) },
  ];

  return (
    <div>
      <PageHeader
        title="Product Locate"
        description="Track product locations and status (read-only)"
      />

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Select value={filters.productId} onValueChange={(value) => setFilters(prev => ({ ...prev, productId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={filters.storeId} onValueChange={(value) => setFilters(prev => ({ ...prev, storeId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={filters.saleStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, saleStatus: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by sale status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sale Status</SelectItem>
              <SelectItem value="true">Sold</SelectItem>
              <SelectItem value="false">Available</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={filters.rewardStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, rewardStatus: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by reward status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reward Status</SelectItem>
              <SelectItem value="true">Claimed</SelectItem>
              <SelectItem value="false">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        data={productLocates}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search by unique key..."
      />
    </div>
  );
}