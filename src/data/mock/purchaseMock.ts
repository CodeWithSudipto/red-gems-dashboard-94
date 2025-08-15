import { Purchase } from '@/types/entities';
import { PurchaseRepository } from '@/data/repositories/purchase';
import { BaseMockRepository } from './base';

export class PurchaseMockRepository extends BaseMockRepository<Purchase> implements PurchaseRepository {
  protected storageKey = 'admin_purchases';
}

export const purchaseRepository = new PurchaseMockRepository();