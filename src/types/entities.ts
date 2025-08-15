export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Regional extends BaseEntity {
  name: string;
}

export interface Territory extends BaseEntity {
  name: string;
  regionalId: string;
}

export interface Area extends BaseEntity {
  name: string;
  territoryId: string;
}

export interface Supplier extends BaseEntity {
  name: string;
  companyName?: string;
  address?: string;
  mobile?: string;
  email?: string;
  category?: string;
  national?: string;
  regional?: string;
  area?: string;
  territory?: string;
  nid?: string;
  dob?: string;
}

export interface Store extends BaseEntity {
  name: string;
  ownerName?: string;
  nid?: string;
  tradeLicense?: string;
  mobile?: string;
  email?: string;
  address?: string;
  googleMapsLocation?: string;
  regionalId?: string;
  territoryId?: string;
  areaId?: string;
}

export interface Customer extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Product extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  stock: number;
  supplierId?: string;
}

export interface Purchase extends BaseEntity {
  productId: string;
  supplierId: string;
  quantity: number;
  total: number;
  purchaseDate: string;
}

export interface ProductItem extends BaseEntity {
  productId: string;
  secureCode: string;
  giftToken?: string;
  isUsed: boolean;
}

export interface ProductLocate extends BaseEntity {
  productId: string;
  storeId?: string;
  customerId?: string;
  saleStatus: boolean;
  rewardStatus: boolean;
  rewardType?: string; // Now supports any custom reward type code
  uniqueKey: string;
}

export interface Sale extends BaseEntity {
  productId: string;
  customerId?: string;
  quantity: number;
  total: number;
  saleDate: string;
  storeId: string;
  regional?: string;
  territory?: string;
  area?: string;
}

export interface StockTransfer extends BaseEntity {
  productId: string;
  fromStoreId: string;
  toStoreId: string;
  quantity: number;
  transferDate: string;
}

export interface RewardSetting extends BaseEntity {
  productId: string;
  rewardTypes: {
    name: string;
    quantityPer100: number;
    code: string; // A, B, C, etc. - used for ProductLocate.rewardType
  }[];
}

export interface RewardGenerationResult {
  eligible: number;
  assigned: number;
  remaining: number;
}

// Utility types
export interface ListOptions {
  page?: number;
  limit?: number;
  q?: string;
  filters?: Record<string, any>;
  sort?: string;
}

export interface ListResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}