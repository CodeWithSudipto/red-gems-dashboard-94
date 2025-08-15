import { Product } from '@/types/entities';
import { BaseRepository } from './base';

export interface ProductRepository extends BaseRepository<Product> {
  updateStock(productId: string, quantityChange: number): Promise<void>;
}