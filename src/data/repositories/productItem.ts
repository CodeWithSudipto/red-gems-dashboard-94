import { ProductItem } from '@/types/entities';
import { BaseRepository } from './base';

export interface ProductItemRepository extends BaseRepository<ProductItem> {
  checkSecureCodeUnique(code: string): Promise<boolean>;
  createBatch(items: Omit<ProductItem, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ProductItem[]>;
}