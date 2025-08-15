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
import { areaRepository, territoryRepository } from '@/data';
import { Area, Territory } from '@/types/entities';
import { formatDate } from '@/utils';

export default function AreaPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Area | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Area | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', territoryId: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { addToast } = useUIStore();

  useEffect(() => {
    loadTerritories();
    loadData();
  }, [currentPage, searchQuery]);

  const loadTerritories = async () => {
    try {
      const result = await territoryRepository.list({ limit: 1000 });
      setTerritories(result.data);
    } catch (error) {
      console.error('Failed to load territories:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await areaRepository.list({
        page: currentPage,
        limit: 10,
        q: searchQuery,
      });
      
      setAreas(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load areas:', error);
      addToast({ message: 'Failed to load areas', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', territoryId: '' });
    setFormErrors({});
    setShowForm(true);
  };

  const handleEdit = (item: Area) => {
    setEditingItem(item);
    setFormData({ name: item.name, territoryId: item.territoryId });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = (item: Area) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.territoryId) {
      errors.territoryId = 'Territory is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingItem) {
        await areaRepository.update(editingItem.id, formData);
        addToast({ message: 'Area updated successfully', type: 'success' });
      } else {
        await areaRepository.create(formData);
        addToast({ message: 'Area created successfully', type: 'success' });
      }
      
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to save area:', error);
      addToast({ message: 'Failed to save area', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await areaRepository.delete(deletingItem.id);
      addToast({ message: 'Area deleted successfully', type: 'success' });
      loadData();
    } catch (error) {
      console.error('Failed to delete area:', error);
      addToast({ message: 'Failed to delete area', type: 'error' });
    }
  };

  const getTerritoryName = (territoryId: string) => {
    const territory = territories.find(t => t.id === territoryId);
    return territory ? territory.name : 'Unknown';
  };

  const columns: Column<Area>[] = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'territoryId',
      label: 'Territory',
      render: (value) => getTerritoryName(value),
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
        title="Area Management"
        description="Manage areas within territories"
        action={{
          label: 'Add Area',
          onClick: handleCreate,
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <DataTable
        data={areas}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search areas..."
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
        title={editingItem ? 'Edit Area' : 'Add Area'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter area name"
            />
            {formErrors.name && (
              <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="territoryId">Territory *</Label>
            <Select
              value={formData.territoryId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, territoryId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a territory" />
              </SelectTrigger>
              <SelectContent>
                {territories.map((territory) => (
                  <SelectItem key={territory.id} value={territory.id}>
                    {territory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.territoryId && (
              <p className="text-sm text-destructive mt-1">{formErrors.territoryId}</p>
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
        title="Delete Area"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}