import { ProductItem } from '@/types/entities';
import { ProductItemRepository } from '@/data/repositories/productItem';
import { BaseMockRepository } from './base';
import { uid, now } from '@/utils';

export class ProductItemMockRepository extends BaseMockRepository<ProductItem> implements ProductItemRepository {
  protected storageKey = 'admin_product_items';

  async checkSecureCodeUnique(code: string): Promise<boolean> {
    const data = this.getData();
    return !data.some(item => item.secureCode === code);
  }

  async createBatch(items: Omit<ProductItem, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ProductItem[]> {
    const data = this.getData();
    const timestamp = now();
    
    const newItems: ProductItem[] = items.map(item => ({
      ...item,
      id: uid(),
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    data.push(...newItems);
    this.saveData(data);
    
    return newItems;
  }
}

export const productItemRepository = new ProductItemMockRepository();