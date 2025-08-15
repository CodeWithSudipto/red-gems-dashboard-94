import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BusinessService, purchaseRepository, productRepository, supplierRepository } from '@/data';
import { Purchase, Product, Supplier } from '@/types/entities';
import { useUIStore } from '@/store';
import { Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    supplierId: '',
    quantity: '',
    unitPrice: '',
    total: '',
    purchaseDate: '',
  });
  const { addToast } = useUIStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [purchasesResult, productsResult, suppliersResult] = await Promise.all([
        purchaseRepository.list({ limit: 1000 }),
        productRepository.list({ limit: 1000 }),
        supplierRepository.list({ limit: 1000 })
      ]);
      setPurchases(purchasesResult.data);
      setProducts(productsResult.data);
      setSuppliers(suppliersResult.data);
    } catch (error) {
      addToast({ message: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.supplierId || !formData.quantity || !formData.unitPrice || !formData.purchaseDate) {
      addToast({ message: 'Please fill all required fields', type: 'error' });
      return;
    }

    try {
      await BusinessService.createPurchase({
        productId: formData.productId,
        supplierId: formData.supplierId,
        quantity: parseInt(formData.quantity),
        total: parseFloat(formData.total),
        purchaseDate: formData.purchaseDate,
      });
      
      addToast({ message: 'Purchase recorded successfully with IMEI codes generated', type: 'success' });
      setIsFormOpen(false);
      setFormData({
        productId: '',
        supplierId: '',
        quantity: '',
        unitPrice: '',
        total: '',
        purchaseDate: '',
      });
      loadData();
    } catch (error) {
      addToast({ message: 'Failed to record purchase', type: 'error' });
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'Unknown Supplier';
  };

  const columns = [
    { key: 'productId', label: 'Product', render: (value: string) => getProductName(value) },
    { key: 'supplierId', label: 'Supplier', render: (value: string) => getSupplierName(value) },
    { key: 'quantity', label: 'Quantity' },
    { key: 'total', label: 'Total', render: (value: number) => formatCurrency(value) },
    { key: 'purchaseDate', label: 'Purchase Date', render: (value: string) => formatDate(value) },
    { key: 'createdAt', label: 'Created', render: (value: string) => formatDate(value) },
  ];

  return (
    <div>
      <PageHeader
        title="Purchases"
        description="Manage product purchases"
        action={{
          label: "Record Purchase",
          onClick: () => setIsFormOpen(true),
          icon: <Plus className="w-4 h-4" />
        }}
      />

      <DataTable
        data={purchases}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search purchases..."
      />

      <FormModal
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setFormData({
            productId: '',
            supplierId: '',
            quantity: '',
            unitPrice: '',
            total: '',
            purchaseDate: '',
          });
        }}
        title="Record Purchase"
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
            <Label htmlFor="supplierId">Supplier *</Label>
            <Select value={formData.supplierId} onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
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
              value={formData.quantity}
              onChange={(e) => {
                const quantity = e.target.value;
                const unitPrice = formData.unitPrice;
                const total = quantity && unitPrice ? (parseInt(quantity) * parseFloat(unitPrice)).toString() : '';
                setFormData(prev => ({ ...prev, quantity, total }));
              }}
              placeholder="Enter quantity"
            />
          </div>

          <div>
            <Label htmlFor="unitPrice">Unit Price *</Label>
            <Input
              id="unitPrice"
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => {
                const unitPrice = e.target.value;
                const quantity = formData.quantity;
                const total = quantity && unitPrice ? (parseInt(quantity) * parseFloat(unitPrice)).toString() : '';
                setFormData(prev => ({ ...prev, unitPrice, total }));
              }}
              placeholder="Enter unit price"
            />
          </div>

          <div>
            <Label htmlFor="total">Total Amount *</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              value={formData.total}
              onChange={(e) => setFormData(prev => ({ ...prev, total: e.target.value }))}
              placeholder="Auto-calculated total"
              readOnly
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="purchaseDate">Purchase Date *</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={formData.purchaseDate || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Record Purchase
            </Button>
          </div>
          </div>
        </form>
      </FormModal>
    </div>
  );
}