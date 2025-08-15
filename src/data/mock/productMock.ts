import { Product } from '@/types/entities';
import { ProductRepository } from '@/data/repositories/product';
import { BaseMockRepository } from './base';

export class ProductMockRepository extends BaseMockRepository<Product> implements ProductRepository {
  protected storageKey = 'admin_products';

  async updateStock(productId: string, quantityChange: number): Promise<void> {
    const data = this.getData();
    const index = data.findIndex(product => product.id === productId);
    
    if (index === -1) {
      throw new Error(`Product with id ${productId} not found`);
    }

    data[index].stock += quantityChange;
    data[index].updatedAt = new Date().toISOString();
    
    this.saveData(data);
  }
}

export const productRepository = new ProductMockRepository();