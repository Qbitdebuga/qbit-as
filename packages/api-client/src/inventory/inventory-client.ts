import { AxiosInstance } from 'axios';
import { 
  IInventoryTransaction,
  ITransactionLine,
  IInventoryLevel,
  IWarehouse,
  IInventoryTransactionListResponse,
  IInventoryLevelListResponse,
  IInventoryFilterParams
} from '@qbit-accounting/shared-types';

export class InventoryClient {
  private transactionsPath = '/transactions';
  private inventoryLevelsPath = '/inventory-levels';
  private warehousesPath = '/warehouses';

  constructor(private readonly http: AxiosInstance) {}

  // Inventory Transactions
  async createTransaction(data: Partial<IInventoryTransaction>): Promise<IInventoryTransaction> {
    const response = await this.http.post(this.transactionsPath, data);
    return response.data;
  }

  async getTransactions(params?: IInventoryFilterParams): Promise<IInventoryTransactionListResponse> {
    const response = await this.http.get(this.transactionsPath, { params });
    return response.data;
  }

  async getTransaction(id: string): Promise<IInventoryTransaction> {
    const response = await this.http.get(`${this.transactionsPath}/${id}`);
    return response.data;
  }

  async updateTransaction(id: string, data: Partial<IInventoryTransaction>): Promise<IInventoryTransaction> {
    const response = await this.http.patch(`${this.transactionsPath}/${id}`, data);
    return response.data;
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.http.delete(`${this.transactionsPath}/${id}`);
  }

  async processTransaction(id: string, data: any): Promise<IInventoryTransaction> {
    const response = await this.http.post(`${this.transactionsPath}/${id}/process`, data);
    return response.data;
  }

  // Inventory Levels
  async getInventoryLevels(params?: IInventoryFilterParams): Promise<IInventoryLevelListResponse> {
    const response = await this.http.get(this.inventoryLevelsPath, { params });
    return response.data;
  }

  async getProductInventoryLevels(productId: number): Promise<IInventoryLevel[]> {
    const response = await this.http.get(`${this.inventoryLevelsPath}/product/${productId}`);
    return response.data;
  }

  async getVariantInventoryLevels(variantId: number): Promise<IInventoryLevel[]> {
    const response = await this.http.get(`${this.inventoryLevelsPath}/variant/${variantId}`);
    return response.data;
  }

  async getWarehouseInventoryLevels(warehouseId: string): Promise<IInventoryLevel[]> {
    const response = await this.http.get(`${this.inventoryLevelsPath}/warehouse/${warehouseId}`);
    return response.data;
  }

  // Warehouses
  async getWarehouses(params?: any): Promise<IWarehouse[]> {
    const response = await this.http.get(this.warehousesPath, { params });
    return response.data;
  }

  async getWarehouse(id: string): Promise<IWarehouse> {
    const response = await this.http.get(`${this.warehousesPath}/${id}`);
    return response.data;
  }
} 