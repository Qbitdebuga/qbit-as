import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class InventoryClientService {
  private readonly logger = new Logger(InventoryClientService.name);
  private readonly baseUrl: string | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this?.configService.get<string>('INVENTORY_SERVICE_URL') || 'http://localhost:3003';
  }

  async getProducts(query: any = {}) {
    try {
      const { data } = await firstValueFrom(
        this?.httpService.get(`${this.baseUrl}/products`, { params: query }).pipe(
          catchError((error: AxiosError) => {
            this?.logger.error(`Error fetching products: ${error.message}`);
            throw new HttpException(
              error.response?.data || 'Failed to fetch products from inventory service',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
      return data;
    } catch (error: any) {
      this?.logger.error(`Error in getProducts: ${error.message}`);
      throw error;
    }
  }

  async getProduct(id: string) {
    try {
      const { data } = await firstValueFrom(
        this?.httpService.get(`${this.baseUrl}/products/${id}`).pipe(
          catchError((error: AxiosError) => {
            this?.logger.error(`Error fetching product ${id}: ${error.message}`);
            throw new HttpException(
              error.response?.data || 'Failed to fetch product from inventory service',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
      return data;
    } catch (error: any) {
      this?.logger.error(`Error in getProduct: ${error.message}`);
      throw error;
    }
  }

  async createProduct(productData: any) {
    try {
      const { data } = await firstValueFrom(
        this?.httpService.post(`${this.baseUrl}/products`, productData).pipe(
          catchError((error: AxiosError) => {
            this?.logger.error(`Error creating product: ${error.message}`);
            throw new HttpException(
              error.response?.data || 'Failed to create product in inventory service',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
      return data;
    } catch (error: any) {
      this?.logger.error(`Error in createProduct: ${error.message}`);
      throw error;
    }
  }

  async updateProduct(id: string, productData: any) {
    try {
      const { data } = await firstValueFrom(
        this?.httpService.patch(`${this.baseUrl}/products/${id}`, productData).pipe(
          catchError((error: AxiosError) => {
            this?.logger.error(`Error updating product ${id}: ${error.message}`);
            throw new HttpException(
              error.response?.data || 'Failed to update product in inventory service',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
      return data;
    } catch (error: any) {
      this?.logger.error(`Error in updateProduct: ${error.message}`);
      throw error;
    }
  }

  async deleteProduct(id: string) {
    try {
      const { data } = await firstValueFrom(
        this?.httpService.delete(`${this.baseUrl}/products/${id}`).pipe(
          catchError((error: AxiosError) => {
            this?.logger.error(`Error deleting product ${id}: ${error.message}`);
            throw new HttpException(
              error.response?.data || 'Failed to delete product from inventory service',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
      return data;
    } catch (error: any) {
      this?.logger.error(`Error in deleteProduct: ${error.message}`);
      throw error;
    }
  }

  async getInventoryTransactions(query: any = {}) {
    try {
      const { data } = await firstValueFrom(
        this?.httpService.get(`${this.baseUrl}/transactions`, { params: query }).pipe(
          catchError((error: AxiosError) => {
            this?.logger.error(`Error fetching inventory transactions: ${error.message}`);
            throw new HttpException(
              error.response?.data || 'Failed to fetch transactions from inventory service',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
      return data;
    } catch (error: any) {
      this?.logger.error(`Error in getInventoryTransactions: ${error.message}`);
      throw error;
    }
  }

  async getInventoryTransaction(id: string) {
    try {
      const { data } = await firstValueFrom(
        this?.httpService.get(`${this.baseUrl}/transactions/${id}`).pipe(
          catchError((error: AxiosError) => {
            this?.logger.error(`Error fetching inventory transaction ${id}: ${error.message}`);
            throw new HttpException(
              error.response?.data || 'Failed to fetch transaction from inventory service',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
      return data;
    } catch (error: any) {
      this?.logger.error(`Error in getInventoryTransaction: ${error.message}`);
      throw error;
    }
  }

  async createInventoryTransaction(transactionData: any) {
    try {
      const { data } = await firstValueFrom(
        this?.httpService.post(`${this.baseUrl}/transactions`, transactionData).pipe(
          catchError((error: AxiosError) => {
            this?.logger.error(`Error creating inventory transaction: ${error.message}`);
            throw new HttpException(
              error.response?.data || 'Failed to create transaction in inventory service',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
      return data;
    } catch (error: any) {
      this?.logger.error(`Error in createInventoryTransaction: ${error.message}`);
      throw error;
    }
  }
} 