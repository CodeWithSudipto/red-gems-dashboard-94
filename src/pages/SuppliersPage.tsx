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
import { useUIStore } from '@/store';
import { supplierRepository } from '@/data';
import { Supplier } from '@/types/entities';
import { formatDate, validateEmail } from '@/utils';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Supplier | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Supplier | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    address: '',
    mobile: '',
    email: '',
    category: '',
    nid: '',
    dob: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { addToast } = useUIStore();

  useEffect(() => {
    loadData();
  }, [currentPage, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await supplierRepository.list({
        page: currentPage,
        limit: 10,
        q: searchQuery,
      });
      
      setSuppliers(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      addToast({ message: 'Failed to load suppliers', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      companyName: '',
      address: '',
      mobile: '',
      email: '',
      category: '',
      nid: '',
      dob: '',
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleEdit = (item: Supplier) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      companyName: item.companyName || '',
      address: item.address || '',
      mobile: item.mobile || '',
      email: item.email || '',
      category: item.category || '',
      nid: item.nid || '',
      dob: item.dob || '',
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = (item: Supplier) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const validateForm = async () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    // Check email uniqueness
    if (formData.email) {
      const isUnique = await supplierRepository.checkEmailUnique(
        formData.email,
        editingItem?.id
      );
      if (!isUnique) {
        errors.email = 'Email already exists';
      }
    }
    
    // Check phone uniqueness  
    if (formData.mobile) {
      const isUnique = await supplierRepository.checkPhoneUnique(
        formData.mobile,
        editingItem?.id
      );
      if (!isUnique) {
        errors.mobile = 'Phone number already exists';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!(await validateForm())) return;

    try {
      const data = {
        name: formData.name,
        companyName: formData.companyName,
        ...(formData.address && { address: formData.address }),
        ...(formData.mobile && { mobile: formData.mobile }),
        ...(formData.email && { email: formData.email }),
        ...(formData.category && { category: formData.category }),
        ...(formData.nid && { nid: formData.nid }),
        ...(formData.dob && { dob: formData.dob }),
      };
      
      if (editingItem) {
        await supplierRepository.update(editingItem.id, data);
        addToast({ message: 'Supplier updated successfully', type: 'success' });
      } else {
        await supplierRepository.create(data);
        addToast({ message: 'Supplier created successfully', type: 'success' });
      }
      
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to save supplier:', error);
      addToast({ message: 'Failed to save supplier', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await supplierRepository.delete(deletingItem.id);
      addToast({ message: 'Supplier deleted successfully', type: 'success' });
      loadData();
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      addToast({ message: 'Failed to delete supplier', type: 'error' });
    }
  };

  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'companyName',
      label: 'Company',
      hideOnMobile: true,
    },
    {
      key: 'email',
      label: 'Email',
      hideOnMobile: true,
    },
    {
      key: 'mobile',
      label: 'Mobile',
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => formatDate(value),
      hideOnMobile: true,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description="Manage your suppliers"
        action={{
          label: 'Add Supplier',
          onClick: handleCreate,
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <DataTable
        data={suppliers}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search suppliers..."
        onSearch={setSearchQuery}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        actions={(item) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(item)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <FormModal
        open={showForm}
        onOpenChange={setShowForm}
        title={editingItem ? 'Edit Supplier' : 'Add Supplier'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Supplier name"
              />
              {formErrors.name && (
                <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Company name"
              />
              {formErrors.companyName && (
                <p className="text-sm text-destructive mt-1">{formErrors.companyName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="Mobile number"
              />
              {formErrors.mobile && (
                <p className="text-sm text-destructive mt-1">{formErrors.mobile}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email address"
              />
              {formErrors.email && (
                <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Business category"
              />
            </div>

            <div>
              <Label htmlFor="nid">NID</Label>
              <Input
                id="nid"
                value={formData.nid}
                onChange={(e) => setFormData(prev => ({ ...prev, nid: e.target.value }))}
                placeholder="National ID"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Full address"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Supplier"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}