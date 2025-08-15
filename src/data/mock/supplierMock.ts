import { Supplier } from '@/types/entities';
import { SupplierRepository } from '@/data/repositories/supplier';
import { BaseMockRepository } from './base';

export class SupplierMockRepository extends BaseMockRepository<Supplier> implements SupplierRepository {
  protected storageKey = 'admin_suppliers';

  async checkEmailUnique(email: string, excludeId?: string): Promise<boolean> {
    const data = this.getData();
    return !data.some(supplier => 
      supplier.email?.toLowerCase() === email.toLowerCase() && 
      supplier.id !== excludeId
    );
  }

  async checkPhoneUnique(phone: string, excludeId?: string): Promise<boolean> {
    const data = this.getData();
    return !data.some(supplier => 
      supplier.mobile === phone && 
      supplier.id !== excludeId
    );
  }
}

export const supplierRepository = new SupplierMockRepository();