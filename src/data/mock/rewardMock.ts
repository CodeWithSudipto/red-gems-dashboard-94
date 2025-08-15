import { RewardSetting, RewardGenerationResult } from '@/types/entities';
import { RewardRepository } from '@/data/repositories/reward';
import { BaseMockRepository } from './base';
import { productLocateRepository } from './productLocateMock';

export class RewardMockRepository extends BaseMockRepository<RewardSetting> implements RewardRepository {
  protected storageKey = 'admin_rewards';

  async generate(productId: string): Promise<RewardGenerationResult> {
    // Get reward setting for this product
    const data = this.getData();
    const setting = data.find(s => s.productId === productId);
    
    if (!setting) {
      throw new Error('Reward setting not found for this product');
    }

    // Get unassigned product locate items
    const unassignedCount = await productLocateRepository.getUnassignedCount(productId);
    const hundredGroups = Math.floor(unassignedCount / 100);
    
    let totalAssigned = 0;
    
    // Assign rewards for each group of 100
    for (let i = 0; i < hundredGroups; i++) {
      // Process each reward type defined in settings
      for (const rewardType of setting.rewardTypes) {
        if (rewardType.quantityPer100 > 0) {
          await productLocateRepository.updateRewardStatus(productId, rewardType.quantityPer100, rewardType.code);
          totalAssigned += rewardType.quantityPer100;
        }
      }
    }

    return {
      eligible: hundredGroups * 100,
      assigned: totalAssigned,
      remaining: unassignedCount - (hundredGroups * 100),
    };
  }
}

export const rewardRepository = new RewardMockRepository();