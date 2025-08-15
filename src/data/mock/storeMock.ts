import { Store } from '@/types/entities';
import { StoreRepository } from '@/data/repositories/store';
import { BaseMockRepository } from './base';

export class StoreMockRepository extends BaseMockRepository<Store> implements StoreRepository {
  protected storageKey = 'admin_stores';
}

export const storeRepository = new StoreMockRepository();