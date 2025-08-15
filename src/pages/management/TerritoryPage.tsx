import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUIStore } from '@/store';
import { territoryRepository, regionalRepository } from '@/data';
import { Territory, Regional } from '@/types/entities';
import { formatDate } from '@/utils';

export default function TerritoryPage() {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [regionals, setRegionals] = useState<Regional[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Territory | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Territory | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', regionalId: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { addToast } = useUIStore();

  useEffect(() => {
    loadRegionals();
    loadData();
  }, [currentPage, searchQuery]);

  const loadRegionals = async () => {
    try {
      const result = await regionalRepository.list({ limit: 1000 });
      setRegionals(result.data);
    } catch (error) {
      console.error('Failed to load regionals:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await territoryRepository.list({
        page: currentPage,
        limit: 10,
        q: searchQuery,
      });
      
      setTerritories(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load territories:', error);
      addToast({ message: 'Failed to load territories', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', regionalId: '' });
    setFormErrors({});
    setShowForm(true);
  };

  const handleEdit = (item: Territory) => {
    setEditingItem(item);
    setFormData({ name: item.name, regionalId: item.regionalId });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = (item: Territory) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.regionalId) {
      errors.regionalId = 'Regional is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingItem) {
        await territoryRepository.update(editingItem.id, formData);
        addToast({ message: 'Territory updated successfully', type: 'success' });
      } else {
        await territoryRepository.create(formData);
        addToast({ message: 'Territory created successfully', type: 'success' });
      }
      
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to save territory:', error);
      addToast({ message: 'Failed to save territory', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await territoryRepository.delete(deletingItem.id);
      addToast({ message: 'Territory deleted successfully', type: 'success' });
      loadData();
    } catch (error) {
      console.error('Failed to delete territory:', error);
      addToast({ message: 'Failed to delete territory', type: 'error' });
    }
  };

  const getRegionalName = (regionalId: string) => {
    const regional = regionals.find(r => r.id === regionalId);
    return regional ? regional.name : 'Unknown';
  };

  const columns: Column<Territory>[] = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'regionalId',
      label: 'Regional',
      render: (value) => getRegionalName(value),
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
        title="Territory Management"
        description="Manage territories within regionals"
        action={{
          label: 'Add Territory',
          onClick: handleCreate,
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <DataTable
        data={territories}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search territories..."
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
        title={editingItem ? 'Edit Territory' : 'Add Territory'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter territory name"
            />
            {formErrors.name && (
              <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="regionalId">Regional *</Label>
            <Select
              value={formData.regionalId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, regionalId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a regional" />
              </SelectTrigger>
              <SelectContent>
                {regionals.map((regional) => (
                  <SelectItem key={regional.id} value={regional.id}>
                    {regional.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.regionalId && (
              <p className="text-sm text-destructive mt-1">{formErrors.regionalId}</p>
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
        title="Delete Territory"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}