import { Supplier } from '@/types/entities';
import { BaseRepository } from './base';

export interface SupplierRepository extends BaseRepository<Supplier> {
  checkEmailUnique(email: string, excludeId?: string): Promise<boolean>;
  checkPhoneUnique(phone: string, excludeId?: string): Promise<boolean>;
}