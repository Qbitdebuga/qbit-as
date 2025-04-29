import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { AuthClientService } from './auth-client.service.js';
import { formatError } from '../utils/error-handler.js';
import { getRequiredConfig } from '../utils/config-utils.js';

@Injectable()
export class InventoryClientService {
  private readonly logger = new Logger(InventoryClientService.name);
  private readonly httpClient: AxiosInstance;
  private readonly serviceUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly authClient: AuthClientService
  ) {
    // These are required config values that will throw if missing
    this.serviceUrl = getRequiredConfig<string>(configService, 'INVENTORY_SERVICE_URL');
    this.apiKey = getRequiredConfig<string>(configService, 'INVENTORY_SERVICE_API_KEY');

    this.httpClient = axios.create({
      baseURL: this.serviceUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
    });

    this.logger.log(`Inventory client initialized with URL: ${this.serviceUrl}`);
  }

  /**
   * Get all products
   */
  async getProducts(page = 1, limit = 20): Promise<any[]> {
    try {
      // Get a service token with the right scope for inventory access
      const serviceToken = await this.authClient.getServiceToken(['inventory:read']);
      
      const response = await this.httpClient.get('/products', {
        params: { page, limit },
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      const { message, stack } = formatError(error);
      this.logger.error(`Failed to get products: ${message}`, stack);
      throw new Error(`Failed to get products: ${message}`);
    }
  }

  /**
   * Get a product by ID
   */
  async getProductById(productId: string): Promise<any> {
    try {
      const serviceToken = await this.authClient.getServiceToken(['inventory:read']);
      
      const response = await this.httpClient.get(`/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      const { message, stack } = formatError(error);
      this.logger.error(`Failed to get product: ${message}`, stack);
      throw new Error(`Failed to get product: ${message}`);
    }
  }

  /**
   * Create a new product
   */
  async createProduct(productData: any): Promise<any> {
    try {
      const serviceToken = await this.authClient.getServiceToken(['inventory:write']);
      
      const response = await this.httpClient.post('/products', productData, {
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      const { message, stack } = formatError(error);
      this.logger.error(`Failed to create product: ${message}`, stack);
      throw new Error(`Failed to create product: ${message}`);
    }
  }

  /**
   * Update a product
   */
  async updateProduct(productId: string, productData: any): Promise<any> {
    try {
      const serviceToken = await this.authClient.getServiceToken(['inventory:write']);
      
      const response = await this.httpClient.patch(`/products/${productId}`, productData, {
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      const { message, stack } = formatError(error);
      this.logger.error(`Failed to update product: ${message}`, stack);
      throw new Error(`Failed to update product: ${message}`);
    }
  }

  /**
   * Get all warehouses
   */
  async getWarehouses(): Promise<any[]> {
    try {
      const serviceToken = await this.authClient.getServiceToken(['inventory:read']);
      
      const response = await this.httpClient.get('/warehouses', {
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      const { message, stack } = formatError(error);
      this.logger.error(`Failed to get warehouses: ${message}`, stack);
      throw new Error(`Failed to get warehouses: ${message}`);
    }
  }

  /**
   * Get a warehouse by ID
   */
  async getWarehouseById(warehouseId: string): Promise<any> {
    try {
      const serviceToken = await this.authClient.getServiceToken(['inventory:read']);
      
      const response = await this.httpClient.get(`/warehouses/${warehouseId}`, {
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      const { message, stack } = formatError(error);
      this.logger.error(`Failed to get warehouse: ${message}`, stack);
      throw new Error(`Failed to get warehouse: ${message}`);
    }
  }

  /**
   * Get inventory transactions
   */
  async getInventoryTransactions(page = 1, limit = 20): Promise<any> {
    try {
      const serviceToken = await this.authClient.getServiceToken(['inventory:read']);
      
      const response = await this.httpClient.get('/transactions', {
        params: { page, limit },
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      const { message, stack } = formatError(error);
      this.logger.error(`Failed to get inventory transactions: ${message}`, stack);
      throw new Error(`Failed to get inventory transactions: ${message}`);
    }
  }

  /**
   * Create a new inventory transaction
   */
  async createInventoryTransaction(transactionData: any): Promise<any> {
    try {
      const serviceToken = await this.authClient.getServiceToken(['inventory:write']);
      
      const response = await this.httpClient.post('/transactions', transactionData, {
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      const { message, stack } = formatError(error);
      this.logger.error(`Failed to create inventory transaction: ${message}`, stack);
      throw new Error(`Failed to create inventory transaction: ${message}`);
    }
  }

  /**
   * Get current stock levels for a specific product or all products
   */
  async getStockLevels(productId?: string, warehouseId?: string): Promise<any> {
    try {
      const serviceToken = await this.authClient.getServiceToken(['inventory:read']);
      
      const response = await this.httpClient.get('/stock', {
        params: { 
          productId, 
          warehouseId 
        },
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      const { message, stack } = formatError(error);
      this.logger.error(`Failed to get stock levels: ${message}`, stack);
      throw new Error(`Failed to get stock levels: ${message}`);
    }
  }
} 