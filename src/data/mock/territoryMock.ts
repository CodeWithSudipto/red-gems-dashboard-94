import { Territory } from '@/types/entities';
import { TerritoryRepository } from '@/data/repositories/territory';
import { BaseMockRepository } from './base';

export class TerritoryMockRepository extends BaseMockRepository<Territory> implements TerritoryRepository {
  protected storageKey = 'admin_territories';

  async getByRegionalId(regionalId: string): Promise<Territory[]> {
    const data = this.getData();
    return data.filter(territory => territory.regionalId === regionalId);
  }
}

export const territoryRepository = new TerritoryMockRepository();