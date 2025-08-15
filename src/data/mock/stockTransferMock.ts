import { StockTransfer } from '@/types/entities';
import { StockTransferRepository } from '@/data/repositories/stockTransfer';
import { BaseMockRepository } from './base';

export class StockTransferMockRepository extends BaseMockRepository<StockTransfer> implements StockTransferRepository {
  protected storageKey = 'admin_stock_transfers';
}

export const stockTransferRepository = new StockTransferMockRepository();