import { Customer } from '@/types/entities';
import { CustomerRepository } from '@/data/repositories/customer';
import { BaseMockRepository } from './base';

export class CustomerMockRepository extends BaseMockRepository<Customer> implements CustomerRepository {
  protected storageKey = 'admin_customers';

  async checkEmailUnique(email: string, excludeId?: string): Promise<boolean> {
    const data = this.getData();
    return !data.some(customer => 
      customer.email?.toLowerCase() === email.toLowerCase() && 
      customer.id !== excludeId
    );
  }

  async checkPhoneUnique(phone: string, excludeId?: string): Promise<boolean> {
    const data = this.getData();
    return !data.some(customer => 
      customer.phone === phone && 
      customer.id !== excludeId
    );
  }
}

export const customerRepository = new CustomerMockRepository();