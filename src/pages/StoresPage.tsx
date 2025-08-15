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
import { GoogleMapsLocationPicker } from '@/components/GoogleMapsLocationPicker';
import { CascadingLocationSelect } from '@/components/CascadingLocationSelect';
import { useUIStore } from '@/store';
import { storeRepository } from '@/data';
import { Store } from '@/types/entities';
import { formatDate, validateEmail } from '@/utils';

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Store | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Store | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    nid: '',
    tradeLicense: '',
    mobile: '',
    email: '',
    address: '',
    googleMapsLocation: '',
    regionalId: '',
    territoryId: '',
    areaId: '',
  });
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { addToast } = useUIStore();

  useEffect(() => {
    loadData();
  }, [currentPage, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await storeRepository.list({
        page: currentPage,
        limit: 10,
        q: searchQuery,
      });
      
      setStores(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load stores:', error);
      addToast({ message: 'Failed to load stores', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      ownerName: '',
      nid: '',
      tradeLicense: '',
      mobile: '',
      email: '',
      address: '',
      googleMapsLocation: '',
      regionalId: '',
      territoryId: '',
      areaId: '',
    });
    setMapLocation(null);
    setFormErrors({});
    setShowForm(true);
  };

  const handleEdit = (item: Store) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      ownerName: item.ownerName || '',
      nid: item.nid || '',
      tradeLicense: item.tradeLicense || '',
      mobile: item.mobile || '',
      email: item.email || '',
      address: item.address || '',
      googleMapsLocation: item.googleMapsLocation || '',
      regionalId: item.regionalId || '',
      territoryId: item.territoryId || '',
      areaId: item.areaId || '',
    });
    
    // Parse existing location
    if (item.googleMapsLocation) {
      try {
        const parsed = JSON.parse(item.googleMapsLocation);
        if (parsed.lat && parsed.lng) {
          setMapLocation(parsed);
        }
      } catch (e) {
        // Handle legacy format or plain text
        setMapLocation(null);
      }
    } else {
      setMapLocation(null);
    }
    
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = (item: Store) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Store name is required';
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Invalid email format';
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
        ...(formData.ownerName && { ownerName: formData.ownerName }),
        ...(formData.nid && { nid: formData.nid }),
        ...(formData.tradeLicense && { tradeLicense: formData.tradeLicense }),
        ...(formData.mobile && { mobile: formData.mobile }),
        ...(formData.email && { email: formData.email }),
        ...(formData.address && { address: formData.address }),
        ...(mapLocation && { googleMapsLocation: JSON.stringify(mapLocation) }),
        ...(formData.regionalId && { regionalId: formData.regionalId }),
        ...(formData.territoryId && { territoryId: formData.territoryId }),
        ...(formData.areaId && { areaId: formData.areaId }),
      };
      
      if (editingItem) {
        await storeRepository.update(editingItem.id, data);
        addToast({ message: 'Store updated successfully', type: 'success' });
      } else {
        await storeRepository.create(data);
        addToast({ message: 'Store created successfully', type: 'success' });
      }
      
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to save store:', error);
      addToast({ message: 'Failed to save store', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await storeRepository.delete(deletingItem.id);
      addToast({ message: 'Store deleted successfully', type: 'success' });
      loadData();
    } catch (error) {
      console.error('Failed to delete store:', error);
      addToast({ message: 'Failed to delete store', type: 'error' });
    }
  };

  const columns: Column<Store>[] = [
    {
      key: 'name',
      label: 'Store Name',
    },
    {
      key: 'ownerName',
      label: 'Owner',
      hideOnMobile: true,
    },
    {
      key: 'mobile',
      label: 'Mobile',
    },
    {
      key: 'email',
      label: 'Email',
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
        title="Stores"
        description="Manage partner stores"
        action={{
          label: 'Add Store',
          onClick: handleCreate,
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <DataTable
        data={stores}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search stores..."
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
        title={editingItem ? 'Edit Store' : 'Add Store'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Store Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Store name"
              />
              {formErrors.name && (
                <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ownerName">Partner Name</Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                placeholder="Store owner/partner name"
              />
            </div>

            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="Mobile number"
              />
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
              <Label htmlFor="nid">NID</Label>
              <Input
                id="nid"
                value={formData.nid}
                onChange={(e) => setFormData(prev => ({ ...prev, nid: e.target.value }))}
                placeholder="National ID"
              />
            </div>

            <div>
              <Label htmlFor="tradeLicense">Trade License</Label>
              <Input
                id="tradeLicense"
                value={formData.tradeLicense}
                onChange={(e) => setFormData(prev => ({ ...prev, tradeLicense: e.target.value }))}
                placeholder="Trade license number"
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

          <CascadingLocationSelect
            onLocationSelect={(location) => 
              setFormData(prev => ({ 
                ...prev, 
                regionalId: location.regionalId || '',
                territoryId: location.territoryId || '',
                areaId: location.areaId || ''
              }))
            }
            initialValues={{
              regionalId: formData.regionalId,
              territoryId: formData.territoryId,
              areaId: formData.areaId
            }}
          />

          <GoogleMapsLocationPicker
            onLocationSelect={setMapLocation}
            initialLocation={mapLocation || undefined}
          />
          
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
        title="Delete Store"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}