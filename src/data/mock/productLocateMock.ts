import { ProductLocate, ListOptions, ListResult } from '@/types/entities';
import { ProductLocateRepository } from '@/data/repositories/productLocate';
import { uid, now } from '@/utils';

export class ProductLocateMockRepository implements ProductLocateRepository {
  private storageKey = 'admin_product_locate';

  private getData(): ProductLocate[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveData(data: ProductLocate[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  async list(options?: ListOptions): Promise<ListResult<ProductLocate>> {
    let data = this.getData();

    // Apply filters
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          data = data.filter(item => (item as any)[key] === value);
        }
      });
    }

    // Apply search
    if (options?.q) {
      const query = options.q.toLowerCase();
      data = data.filter(item => 
        item.uniqueKey.toLowerCase().includes(query) ||
        (item.storeId && item.storeId.toLowerCase().includes(query)) ||
        (item.customerId && item.customerId.toLowerCase().includes(query))
      );
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    return {
      data: data.slice(offset, offset + limit),
      total: data.length,
      page,
      limit,
      totalPages: Math.ceil(data.length / limit),
    };
  }

  async getById(id: string): Promise<ProductLocate | null> {
    const data = this.getData();
    return data.find(item => item.id === id) || null;
  }

  async createBatch(items: Omit<ProductLocate, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ProductLocate[]> {
    const data = this.getData();
    const timestamp = now();
    
    const newItems: ProductLocate[] = items.map(item => ({
      ...item,
      id: uid(),
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    data.push(...newItems);
    this.saveData(data);
    
    return newItems;
  }

  async markAsSold(productId: string, storeId: string, quantity: number, customerId?: string): Promise<void> {
    const data = this.getData();
    let marked = 0;
    
    for (let i = 0; i < data.length && marked < quantity; i++) {
      if (data[i].productId === productId && 
          data[i].storeId === storeId && 
          !data[i].saleStatus) {
        data[i].saleStatus = true;
        data[i].customerId = customerId;
        data[i].updatedAt = now();
        marked++;
      }
    }
    
    this.saveData(data);
  }

  async transferStock(productId: string, fromStoreId: string, toStoreId: string, quantity: number): Promise<void> {
    const data = this.getData();
    let transferred = 0;
    
    for (let i = 0; i < data.length && transferred < quantity; i++) {
      if (data[i].productId === productId && 
          data[i].storeId === fromStoreId && 
          !data[i].saleStatus) {
        data[i].storeId = toStoreId;
        data[i].updatedAt = now();
        transferred++;
      }
    }
    
    this.saveData(data);
  }

  async updateRewardStatus(productId: string, quantity: number, rewardType?: string): Promise<void> {
    const data = this.getData();
    let updated = 0;
    
    for (let i = 0; i < data.length && updated < quantity; i++) {
      if (data[i].productId === productId && !data[i].rewardStatus) {
        data[i].rewardStatus = true;
        data[i].rewardType = rewardType;
        data[i].updatedAt = now();
        updated++;
      }
    }
    
    this.saveData(data);
  }

  async getUnassignedCount(productId: string): Promise<number> {
    const data = this.getData();
    return data.filter(item => 
      item.productId === productId && !item.rewardStatus
    ).length;
  }
}

export const productLocateRepository = new ProductLocateMockRepository();