import { Sale } from '@/types/entities';
import { SaleRepository } from '@/data/repositories/sale';
import { BaseMockRepository } from './base';

export class SaleMockRepository extends BaseMockRepository<Sale> implements SaleRepository {
  protected storageKey = 'admin_sales';
}

export const saleRepository = new SaleMockRepository();