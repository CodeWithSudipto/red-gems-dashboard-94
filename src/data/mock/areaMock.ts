import { Area } from '@/types/entities';
import { AreaRepository } from '@/data/repositories/area';
import { BaseMockRepository } from './base';

export class AreaMockRepository extends BaseMockRepository<Area> implements AreaRepository {
  protected storageKey = 'admin_areas';

  async getByTerritoryId(territoryId: string): Promise<Area[]> {
    const data = this.getData();
    return data.filter(area => area.territoryId === territoryId);
  }
}

export const areaRepository = new AreaMockRepository();