import { Customer } from '@/types/entities';
import { BaseRepository } from './base';

export interface CustomerRepository extends BaseRepository<Customer> {
  checkEmailUnique(email: string, excludeId?: string): Promise<boolean>;
  checkPhoneUnique(phone: string, excludeId?: string): Promise<boolean>;
}