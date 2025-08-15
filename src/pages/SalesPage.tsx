import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saleRepository, productRepository, storeRepository, customerRepository } from '@/data';
import { Sale, Product, Store, Customer } from '@/types/entities';
import { useUIStore } from '@/store';
import { Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils';

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Sale>>({});
  const { addToast } = useUIStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesResult, productsResult, storesResult, customersResult] = await Promise.all([
        saleRepository.list({ limit: 1000 }),
        productRepository.list({ limit: 1000 }),
        storeRepository.list({ limit: 1000 }),
        customerRepository.list({ limit: 1000 })
      ]);
      setSales(salesResult.data);
      setProducts(productsResult.data);
      setStores(storesResult.data);
      setCustomers(customersResult.data);
    } catch (error) {
      addToast({ message: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.storeId || !formData.quantity || !formData.total || !formData.saleDate) {
      addToast({ message: 'Please fill all required fields', type: 'error' });
      return;
    }

    try {
      await saleRepository.create({
        productId: formData.productId,
        storeId: formData.storeId,
        customerId: formData.customerId,
        quantity: formData.quantity,
        total: formData.total,
        saleDate: formData.saleDate,
        regional: formData.regional,
        territory: formData.territory,
        area: formData.area,
      });
      
      addToast({ message: 'Sale recorded successfully', type: 'success' });
      setIsFormOpen(false);
      setFormData({});
      loadData();
    } catch (error) {
      addToast({ message: 'Failed to record sale', type: 'error' });
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store?.name || 'Unknown Store';
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'Walk-in Customer';
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const columns = [
    { key: 'productId', label: 'Product', render: (value: string) => getProductName(value) },
    { key: 'storeId', label: 'Store', render: (value: string) => getStoreName(value) },
    { key: 'customerId', label: 'Customer', render: (value?: string) => getCustomerName(value) },
    { key: 'quantity', label: 'Quantity' },
    { key: 'total', label: 'Total', render: (value: number) => formatCurrency(value) },
    { key: 'saleDate', label: 'Sale Date', render: (value: string) => formatDate(value) },
    { key: 'regional', label: 'Regional' },
    { key: 'territory', label: 'Territory' },
    { key: 'area', label: 'Area' },
  ];

  return (
    <div>
      <PageHeader
        title="Sales"
        description="Manage product sales"
        action={{
          label: "Record Sale",
          onClick: () => setIsFormOpen(true),
          icon: <Plus className="w-4 h-4" />
        }}
      />

      <DataTable
        data={sales}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search sales..."
      />

      <FormModal
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setFormData({});
        }}
        title="Record Sale"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="productId">Product *</Label>
            <Select value={formData.productId} onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="storeId">Store *</Label>
            <Select value={formData.storeId} onValueChange={(value) => setFormData(prev => ({ ...prev, storeId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="customerId">Customer (Optional)</Label>
            <Select value={formData.customerId || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value === 'none' ? undefined : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Walk-in Customer</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
              placeholder="Enter quantity"
            />
          </div>

          <div>
            <Label htmlFor="total">Total Amount *</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              value={formData.total || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, total: parseFloat(e.target.value) }))}
              placeholder="Enter total amount"
            />
          </div>

          <div>
            <Label htmlFor="saleDate">Sale Date *</Label>
            <Input
              id="saleDate"
              type="date"
              value={formData.saleDate || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, saleDate: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="regional">Regional (Optional)</Label>
            <Input
              id="regional"
              value={formData.regional || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, regional: e.target.value }))}
              placeholder="Enter regional"
            />
          </div>

          <div>
            <Label htmlFor="territory">Territory (Optional)</Label>
            <Input
              id="territory"
              value={formData.territory || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, territory: e.target.value }))}
              placeholder="Enter territory"
            />
          </div>

          <div>
            <Label htmlFor="area">Area (Optional)</Label>
            <Input
              id="area"
              value={formData.area || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
              placeholder="Enter area"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Record Sale
            </Button>
          </div>
          </div>
        </form>
      </FormModal>
    </div>
  );
}