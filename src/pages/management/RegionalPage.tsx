import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUIStore } from '@/store';
import { regionalRepository } from '@/data';
import { Regional } from '@/types/entities';
import { formatDate } from '@/utils';

export default function RegionalPage() {
  const [regionals, setRegionals] = useState<Regional[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Regional | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Regional | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { addToast } = useUIStore();

  useEffect(() => {
    loadData();
  }, [currentPage, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await regionalRepository.list({
        page: currentPage,
        limit: 10,
        q: searchQuery,
      });
      
      setRegionals(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load regionals:', error);
      addToast({ message: 'Failed to load regionals', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ name: '' });
    setFormErrors({});
    setShowForm(true);
  };

  const handleEdit = (item: Regional) => {
    setEditingItem(item);
    setFormData({ name: item.name });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = (item: Regional) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingItem) {
        await regionalRepository.update(editingItem.id, formData);
        addToast({ message: 'Regional updated successfully', type: 'success' });
      } else {
        await regionalRepository.create(formData);
        addToast({ message: 'Regional created successfully', type: 'success' });
      }
      
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to save regional:', error);
      addToast({ message: 'Failed to save regional', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await regionalRepository.delete(deletingItem.id);
      addToast({ message: 'Regional deleted successfully', type: 'success' });
      loadData();
    } catch (error) {
      console.error('Failed to delete regional:', error);
      addToast({ message: 'Failed to delete regional', type: 'error' });
    }
  };

  const columns: Column<Regional>[] = [
    {
      key: 'name',
      label: 'Name',
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
        title="Regional Management"
        description="Manage regional divisions"
        action={{
          label: 'Add Regional',
          onClick: handleCreate,
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <DataTable
        data={regionals}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search regionals..."
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
        title={editingItem ? 'Edit Regional' : 'Add Regional'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter regional name"
            />
            {formErrors.name && (
              <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
            )}
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
        title="Delete Regional"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}