import { RewardSetting, RewardGenerationResult } from '@/types/entities';
import { BaseRepository } from './base';

export interface RewardRepository extends BaseRepository<RewardSetting> {
  generate(productId: string): Promise<RewardGenerationResult>;
}