import { ProductLocate, ListOptions, ListResult } from '@/types/entities';

export interface ProductLocateRepository {
  list(options?: ListOptions): Promise<ListResult<ProductLocate>>;
  getById(id: string): Promise<ProductLocate | null>;
  createBatch(items: Omit<ProductLocate, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ProductLocate[]>;
  markAsSold(productId: string, storeId: string, quantity: number, customerId?: string): Promise<void>;
  transferStock(productId: string, fromStoreId: string, toStoreId: string, quantity: number): Promise<void>;
  updateRewardStatus(productId: string, quantity: number, rewardType?: string): Promise<void>;
  getUnassignedCount(productId: string): Promise<number>;
}