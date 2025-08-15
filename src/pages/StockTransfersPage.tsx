import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { stockTransferRepository, productRepository, storeRepository } from '@/data';
import { StockTransfer, Product, Store } from '@/types/entities';
import { useUIStore } from '@/store';
import { Plus } from 'lucide-react';
import { formatDate } from '@/utils';

export default function StockTransfersPage() {
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<StockTransfer>>({});
  const { addToast } = useUIStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transfersResult, productsResult, storesResult] = await Promise.all([
        stockTransferRepository.list({ limit: 1000 }),
        productRepository.list({ limit: 1000 }),
        storeRepository.list({ limit: 1000 })
      ]);
      setStockTransfers(transfersResult.data);
      setProducts(productsResult.data);
      setStores(storesResult.data);
    } catch (error) {
      addToast({ message: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.fromStoreId || !formData.toStoreId || !formData.quantity || !formData.transferDate) {
      addToast({ message: 'Please fill all required fields', type: 'error' });
      return;
    }

    if (formData.fromStoreId === formData.toStoreId) {
      addToast({ message: 'From and To stores cannot be the same', type: 'error' });
      return;
    }

    try {
      await stockTransferRepository.create({
        productId: formData.productId,
        fromStoreId: formData.fromStoreId,
        toStoreId: formData.toStoreId,
        quantity: formData.quantity,
        transferDate: formData.transferDate,
      });
      
      addToast({ message: 'Stock transfer recorded successfully', type: 'success' });
      setIsFormOpen(false);
      setFormData({});
      loadData();
    } catch (error) {
      addToast({ message: 'Failed to record stock transfer', type: 'error' });
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

  const columns = [
    { key: 'productId', label: 'Product', render: (value: string) => getProductName(value) },
    { key: 'fromStoreId', label: 'From Store', render: (value: string) => getStoreName(value) },
    { key: 'toStoreId', label: 'To Store', render: (value: string) => getStoreName(value) },
    { key: 'quantity', label: 'Quantity' },
    { key: 'transferDate', label: 'Transfer Date', render: (value: string) => formatDate(value) },
    { key: 'createdAt', label: 'Created', render: (value: string) => formatDate(value) },
  ];

  return (
    <div>
      <PageHeader
        title="Stock Transfers"
        description="Manage stock transfers between stores"
        action={{
          label: "New Transfer",
          onClick: () => setIsFormOpen(true),
          icon: <Plus className="w-4 h-4" />
        }}
      />

      <DataTable
        data={stockTransfers}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search transfers..."
      />

      <FormModal
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setFormData({});
        }}
        title="New Stock Transfer"
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
            <Label htmlFor="fromStoreId">From Store *</Label>
            <Select value={formData.fromStoreId} onValueChange={(value) => setFormData(prev => ({ ...prev, fromStoreId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select source store" />
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
            <Label htmlFor="toStoreId">To Store *</Label>
            <Select value={formData.toStoreId} onValueChange={(value) => setFormData(prev => ({ ...prev, toStoreId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination store" />
              </SelectTrigger>
              <SelectContent>
                {stores.filter(store => store.id !== formData.fromStoreId).map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
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
            <Label htmlFor="transferDate">Transfer Date *</Label>
            <Input
              id="transferDate"
              type="date"
              value={formData.transferDate || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, transferDate: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Transfer
            </Button>
          </div>
          </div>
        </form>
      </FormModal>
    </div>
  );
}