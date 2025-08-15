import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUIStore } from '@/store';
import { productRepository, supplierRepository } from '@/data';
import { Product, Supplier } from '@/types/entities';
import { formatDate, formatCurrency } from '@/utils';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    supplierId: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { addToast } = useUIStore();

  useEffect(() => {
    loadSuppliers();
    loadData();
  }, [currentPage, searchQuery]);

  const loadSuppliers = async () => {
    try {
      const result = await supplierRepository.list({ limit: 1000 });
      setSuppliers(result.data);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await productRepository.list({
        page: currentPage,
        limit: 10,
        q: searchQuery,
      });
      setProducts(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load products:', error);
      addToast({ message: 'Failed to load products', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', price: '', stock: '', supplierId: '' });
    setFormErrors({});
    setShowForm(true);
  };

  const handleEdit = (item: Product) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      stock: item.stock.toString(),
      supplierId: item.supplierId || '',
    });
    setFormErrors({});
    setShowForm(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      errors.price = 'Valid price is required';
    }
    if (!formData.stock || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      errors.stock = 'Valid stock quantity is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        supplierId: formData.supplierId || undefined,
      };
      
      if (editingItem) {
        await productRepository.update(editingItem.id, data);
        addToast({ message: 'Product updated successfully', type: 'success' });
      } else {
        await productRepository.create(data);
        addToast({ message: 'Product created successfully', type: 'success' });
      }
      
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to save product:', error);
      addToast({ message: 'Failed to save product', type: 'error' });
    }
  };

  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return 'No Supplier';
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown';
  };

  const columns: Column<Product>[] = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price', render: (value) => formatCurrency(value) },
    { key: 'stock', label: 'Stock' },
    { key: 'supplierId', label: 'Supplier', render: (value) => getSupplierName(value), hideOnMobile: true },
    { key: 'createdAt', label: 'Created', render: (value) => formatDate(value), hideOnMobile: true },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product inventory"
        action={{ label: 'Add Product', onClick: handleCreate, icon: <Plus className="h-4 w-4" /> }}
      />

      <DataTable
        data={products}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search products..."
        onSearch={setSearchQuery}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        actions={(item) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setDeletingItem(item); setShowDeleteDialog(true); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <FormModal open={showForm} onOpenChange={setShowForm} title={editingItem ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Product name" />
              {formErrors.name && <p className="text-sm text-destructive mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <Label htmlFor="supplierId">Supplier</Label>
              <Select value={formData.supplierId} onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}>
                <SelectTrigger><SelectValue placeholder="Select a supplier" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} placeholder="0.00" />
              {formErrors.price && <p className="text-sm text-destructive mt-1">{formErrors.price}</p>}
            </div>
            <div>
              <Label htmlFor="stock">Stock *</Label>
              <Input id="stock" type="number" value={formData.stock} onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))} placeholder="0" />
              {formErrors.stock && <p className="text-sm text-destructive mt-1">{formErrors.stock}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Product description" rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">{editingItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Product"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        onConfirm={async () => {
          if (deletingItem) {
            try {
              await productRepository.delete(deletingItem.id);
              addToast({ message: 'Product deleted successfully', type: 'success' });
              loadData();
            } catch (error) {
              addToast({ message: 'Failed to delete product', type: 'error' });
            }
          }
        }}
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}