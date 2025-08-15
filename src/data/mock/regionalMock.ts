import { Regional } from '@/types/entities';
import { RegionalRepository } from '@/data/repositories/regional';
import { BaseMockRepository } from './base';

export class RegionalMockRepository extends BaseMockRepository<Regional> implements RegionalRepository {
  protected storageKey = 'admin_regionals';
}

export const regionalRepository = new RegionalMockRepository();