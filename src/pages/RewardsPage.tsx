import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { rewardRepository, productRepository } from '@/data';
import { RewardSetting, Product } from '@/types/entities';
import { useUIStore } from '@/store';
import { Plus, Gift, Trash2, PlusCircle } from 'lucide-react';
import { formatDate } from '@/utils';

export default function RewardsPage() {
  const [rewardSettings, setRewardSettings] = useState<RewardSetting[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<{
    productId: string;
    rewardTypes: { name: string; quantityPer100: string; code: string }[];
  }>({
    productId: '',
    rewardTypes: [
      { name: 'Premium Gift', quantityPer100: '', code: 'A' },
      { name: 'Standard Gift', quantityPer100: '', code: 'B' },
      { name: 'Bonus Gift', quantityPer100: '', code: 'C' }
    ]
  });
  const [generatingRewards, setGeneratingRewards] = useState(false);
  const [rewardSummary, setRewardSummary] = useState<any>(null);
  const { addToast } = useUIStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsResult, productsResult] = await Promise.all([
        rewardRepository.list({ limit: 1000 }),
        productRepository.list({ limit: 1000 })
      ]);
      setRewardSettings(settingsResult.data);
      setProducts(productsResult.data);
    } catch (error) {
      addToast({ message: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || formData.rewardTypes.length === 0) {
      addToast({ message: 'Please select a product and add at least one reward type', type: 'error' });
      return;
    }

    // Validate all reward types have required data
    const hasEmptyFields = formData.rewardTypes.some(rt => !rt.name.trim() || !rt.quantityPer100 || !rt.code.trim());
    if (hasEmptyFields) {
      addToast({ message: 'Please fill all reward type fields', type: 'error' });
      return;
    }

    try {
      await rewardRepository.create({
        productId: formData.productId,
        rewardTypes: formData.rewardTypes.map(rt => ({
          name: rt.name,
          quantityPer100: parseInt(rt.quantityPer100),
          code: rt.code
        }))
      });
      
      addToast({ message: 'Reward setting saved successfully', type: 'success' });
      setIsFormOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      addToast({ message: 'Failed to save reward setting', type: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      rewardTypes: [
        { name: 'Premium Gift', quantityPer100: '', code: 'A' },
        { name: 'Standard Gift', quantityPer100: '', code: 'B' },
        { name: 'Bonus Gift', quantityPer100: '', code: 'C' }
      ]
    });
  };

  const handleGenerateRewards = async (productId: string) => {
    try {
      setGeneratingRewards(true);
      const summary = await rewardRepository.generate(productId);
      setRewardSummary(summary);
      addToast({ 
        message: `Rewards generated: ${summary.assigned} out of ${summary.eligible} eligible items`, 
        type: 'success' 
      });
      loadData();
    } catch (error) {
      addToast({ message: 'Failed to generate rewards', type: 'error' });
    } finally {
      setGeneratingRewards(false);
    }
  };

  const addRewardType = () => {
    const nextCode = String.fromCharCode(65 + formData.rewardTypes.length); // A, B, C, D, etc.
    setFormData(prev => ({
      ...prev,
      rewardTypes: [...prev.rewardTypes, { name: '', quantityPer100: '', code: nextCode }]
    }));
  };

  const removeRewardType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rewardTypes: prev.rewardTypes.filter((_, i) => i !== index)
    }));
  };

  const updateRewardType = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      rewardTypes: prev.rewardTypes.map((rt, i) => 
        i === index ? { ...rt, [field]: value } : rt
      )
    }));
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const renderRewardTypes = (rewardTypes: RewardSetting['rewardTypes']) => {
    return rewardTypes.map((rt, index) => (
      <div key={index} className="text-sm">
        <span className="font-medium">{rt.name}:</span> {rt.quantityPer100}
      </div>
    ));
  };

  const columns = [
    { key: 'productId', label: 'Product', render: (value: string) => getProductName(value) },
    { 
      key: 'rewardTypes', 
      label: 'Reward Configuration', 
      render: (value: RewardSetting['rewardTypes']) => (
        <div className="space-y-1">
          {renderRewardTypes(value)}
        </div>
      )
    },
    { key: 'createdAt', label: 'Created', render: (value: string) => formatDate(value) },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, item: RewardSetting) => (
        <Button
          size="sm"
          onClick={() => handleGenerateRewards(item.productId)}
          disabled={generatingRewards}
        >
          <Gift className="w-4 h-4 mr-2" />
          Generate
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Rewards"
        description="Manage dynamic reward settings and generation"
        action={{
          label: "Add Setting",
          onClick: () => setIsFormOpen(true),
          icon: <Plus className="w-4 h-4" />
        }}
      />

      {rewardSummary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Reward Generation Summary</CardTitle>
            <CardDescription>Latest reward generation results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{rewardSummary.eligible}</div>
                <div className="text-sm text-muted-foreground">Eligible Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{rewardSummary.assigned}</div>
                <div className="text-sm text-muted-foreground">Rewards Assigned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{rewardSummary.remaining}</div>
                <div className="text-sm text-muted-foreground">Remaining Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={rewardSettings}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search reward settings..."
      />

      <FormModal
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) resetForm();
        }}
        title="Dynamic Reward Setting"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between mb-3">
              <Label>Reward Types Configuration</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRewardType}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Reward Type
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.rewardTypes.map((rewardType, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <Label htmlFor={`name-${index}`}>Reward Name *</Label>
                      <Input
                        id={`name-${index}`}
                        value={rewardType.name}
                        onChange={(e) => updateRewardType(index, 'name', e.target.value)}
                        placeholder="e.g., Premium Gift"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`quantity-${index}`}>Qty per 100 Units *</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        value={rewardType.quantityPer100}
                        onChange={(e) => updateRewardType(index, 'quantityPer100', e.target.value)}
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`code-${index}`}>Code *</Label>
                      <Input
                        id={`code-${index}`}
                        value={rewardType.code}
                        onChange={(e) => updateRewardType(index, 'code', e.target.value)}
                        placeholder="e.g., A"
                        maxLength={3}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeRewardType(index)}
                        disabled={formData.rewardTypes.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Configuration
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}