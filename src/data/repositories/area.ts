import { Area } from '@/types/entities';
import { BaseRepository } from './base';

export interface AreaRepository extends BaseRepository<Area> {
  getByTerritoryId(territoryId: string): Promise<Area[]>;
}