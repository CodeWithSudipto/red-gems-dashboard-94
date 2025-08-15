// Main data provider - switch between mock and real implementations here
import { regionalRepository } from './mock/regionalMock';
import { territoryRepository } from './mock/territoryMock';
import { areaRepository } from './mock/areaMock';
import { supplierRepository } from './mock/supplierMock';
import { storeRepository } from './mock/storeMock';
import { customerRepository } from './mock/customerMock';
import { productRepository } from './mock/productMock';
import { purchaseRepository } from './mock/purchaseMock';
import { productItemRepository } from './mock/productItemMock';
import { productLocateRepository } from './mock/productLocateMock';
import { saleRepository } from './mock/saleMock';
import { stockTransferRepository } from './mock/stockTransferMock';
import { rewardRepository } from './mock/rewardMock';

// Export all repositories - can be swapped to HTTP implementations later
export {
  regionalRepository,
  territoryRepository,
  areaRepository,
  supplierRepository,
  storeRepository,
  customerRepository,
  productRepository,
  purchaseRepository,
  productItemRepository,
  productLocateRepository,
  saleRepository,
  stockTransferRepository,
  rewardRepository,
};

// Business logic services
export class BusinessService {
  // Handle purchase creation with side effects
  static async createPurchase(purchaseData: {
    productId: string;
    supplierId: string;
    quantity: number;
    total: number;
    purchaseDate: string;
  }) {
    // 1. Create the purchase
    const purchase = await purchaseRepository.create(purchaseData);
    
    // 2. Update product stock
    await productRepository.updateStock(purchaseData.productId, purchaseData.quantity);
    
    // 3. Create ProductItems with unique secure codes
    const productItems = [];
    for (let i = 0; i < purchaseData.quantity; i++) {
      const { generateSecureCode, isSecureCodeUnique } = await import('@/utils');
      const uniqueCode = await isSecureCodeUnique(
        generateSecureCode(),
        async (code) => await productItemRepository.checkSecureCodeUnique(code)
      );
      
      productItems.push({
        productId: purchaseData.productId,
        secureCode: uniqueCode,
        isUsed: false,
      });
    }
    
    const createdItems = await productItemRepository.createBatch(productItems);
    
    // 4. Create ProductLocate entries
    const productLocateItems = createdItems.map(item => ({
      productId: item.productId,
      saleStatus: false,
      rewardStatus: false,
      uniqueKey: item.secureCode,
    }));
    
    await productLocateRepository.createBatch(productLocateItems);
    
    return purchase;
  }

  // Handle sale creation with side effects
  static async createSale(saleData: {
    productId: string;
    customerId?: string;
    quantity: number;
    total: number;
    saleDate: string;
    storeId: string;
    regional?: string;
    territory?: string;
    area?: string;
  }) {
    // 1. Create the sale
    const sale = await saleRepository.create(saleData);
    
    // 2. Update product stock
    await productRepository.updateStock(saleData.productId, -saleData.quantity);
    
    // 3. Mark ProductLocate items as sold
    await productLocateRepository.markAsSold(
      saleData.productId,
      saleData.storeId,
      saleData.quantity,
      saleData.customerId
    );
    
    return sale;
  }

  // Handle stock transfer creation with side effects
  static async createStockTransfer(transferData: {
    productId: string;
    fromStoreId: string;
    toStoreId: string;
    quantity: number;
    transferDate: string;
  }) {
    // 1. Create the transfer
    const transfer = await stockTransferRepository.create(transferData);
    
    // 2. Move ProductLocate items between stores
    await productLocateRepository.transferStock(
      transferData.productId,
      transferData.fromStoreId,
      transferData.toStoreId,
      transferData.quantity
    );
    
    return transfer;
  }
}