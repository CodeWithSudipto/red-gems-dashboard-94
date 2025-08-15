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
import { customerRepository } from '@/data';
import { Customer } from '@/types/entities';
import { formatDate, validateEmail } from '@/utils';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Customer | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Customer | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { addToast } = useUIStore();

  useEffect(() => {
    loadData();
  }, [currentPage, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await customerRepository.list({
        page: currentPage,
        limit: 10,
        q: searchQuery,
      });
      
      setCustomers(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load customers:', error);
      addToast({ message: 'Failed to load customers', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleEdit = (item: Customer) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || '',
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = (item: Customer) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const validateForm = async () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    // Check email uniqueness
    if (formData.email) {
      const isUnique = await customerRepository.checkEmailUnique(
        formData.email,
        editingItem?.id
      );
      if (!isUnique) {
        errors.email = 'Email already exists';
      }
    }
    
    // Check phone uniqueness  
    if (formData.phone) {
      const isUnique = await customerRepository.checkPhoneUnique(
        formData.phone,
        editingItem?.id
      );
      if (!isUnique) {
        errors.phone = 'Phone number already exists';
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
        ...(formData.email && { email: formData.email }),
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.address && { address: formData.address }),
      };
      
      if (editingItem) {
        await customerRepository.update(editingItem.id, data);
        addToast({ message: 'Customer updated successfully', type: 'success' });
      } else {
        await customerRepository.create(data);
        addToast({ message: 'Customer created successfully', type: 'success' });
      }
      
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to save customer:', error);
      addToast({ message: 'Failed to save customer', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await customerRepository.delete(deletingItem.id);
      addToast({ message: 'Customer deleted successfully', type: 'success' });
      loadData();
    } catch (error) {
      console.error('Failed to delete customer:', error);
      addToast({ message: 'Failed to delete customer', type: 'error' });
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
      hideOnMobile: true,
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'address',
      label: 'Address',
      hideOnMobile: true,
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
        title="Customers"
        description="Manage your customers"
        action={{
          label: 'Add Customer',
          onClick: handleCreate,
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <DataTable
        data={customers}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search customers..."
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
        title={editingItem ? 'Edit Customer' : 'Add Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Customer name"
            />
            {formErrors.name && (
              <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
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
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Phone number"
            />
            {formErrors.phone && (
              <p className="text-sm text-destructive mt-1">{formErrors.phone}</p>
            )}
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
        title="Delete Customer"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}