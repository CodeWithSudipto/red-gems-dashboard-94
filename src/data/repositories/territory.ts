import { Territory } from '@/types/entities';
import { BaseRepository } from './base';

export interface TerritoryRepository extends BaseRepository<Territory> {
  getByRegionalId(regionalId: string): Promise<Territory[]>;
}