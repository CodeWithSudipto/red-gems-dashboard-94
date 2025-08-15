import { BaseEntity, ListOptions, ListResult } from '@/types/entities';
import { uid, now } from '@/utils';

export abstract class BaseMockRepository<T extends BaseEntity> {
  protected abstract storageKey: string;

  protected getData(): T[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  protected saveData(data: T[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  protected applyFilters(data: T[], options?: ListOptions): T[] {
    let filtered = [...data];

    // Search
    if (options?.q) {
      const query = options.q.toLowerCase();
      filtered = filtered.filter(item => 
        Object.values(item).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(query)
        )
      );
    }

    // Additional filters
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          filtered = filtered.filter(item => 
            (item as any)[key] === value
          );
        }
      });
    }

    // Sort
    if (options?.sort) {
      const [field, direction = 'asc'] = options.sort.split(':');
      filtered.sort((a, b) => {
        const aVal = (a as any)[field];
        const bVal = (b as any)[field];
        
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }

  async list(options?: ListOptions): Promise<ListResult<T>> {
    const data = this.getData();
    const filtered = this.applyFilters(data, options);

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const paginatedData = filtered.slice(offset, offset + limit);

    return {
      data: paginatedData,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  async getById(id: string): Promise<T | null> {
    const data = this.getData();
    return data.find(item => item.id === id) || null;
  }

  async create(input: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const data = this.getData();
    const timestamp = now();
    
    const newItem: T = {
      ...input,
      id: uid(),
      createdAt: timestamp,
      updatedAt: timestamp,
    } as T;

    data.push(newItem);
    this.saveData(data);
    
    return newItem;
  }

  async update(id: string, updates: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T> {
    const data = this.getData();
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }

    data[index] = {
      ...data[index],
      ...updates,
      updatedAt: now(),
    };

    this.saveData(data);
    return data[index];
  }

  async delete(id: string): Promise<void> {
    const data = this.getData();
    const filtered = data.filter(item => item.id !== id);
    
    if (filtered.length === data.length) {
      throw new Error(`Item with id ${id} not found`);
    }

    this.saveData(filtered);
  }
}