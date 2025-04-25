/**
 * Inventory Interfaces
 * 
 * This file contains all interfaces related to inventory management.
 */

import { IProduct, IProductVariant, IInventoryLevel } from '../models/product';

/**
 * Warehouse interface
 */
export interface IWarehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Warehouse location interface
 */
export interface IWarehouseLocation {
  id: string;
  warehouseId: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transaction line interface
 */
export interface ITransactionLine {
  id: string;
  transactionId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitCost?: number;
  product?: IProduct;
  variant?: IProductVariant;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Inventory transaction interface
 */
export interface IInventoryTransaction {
  id: string;
  type: 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'ADJUSTMENT';
  status: 'DRAFT' | 'PENDING' | 'PROCESSED' | 'CANCELLED';
  sourceWarehouseId?: string;
  sourceLocationId?: string;
  destinationWarehouseId?: string;
  destinationLocationId?: string;
  referenceNumber?: string;
  notes?: string;
  lines: ITransactionLine[];
  sourceWarehouse?: IWarehouse;
  destinationWarehouse?: IWarehouse;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

/**
 * Inventory transaction list response interface
 */
export interface IInventoryTransactionListResponse {
  data: IInventoryTransaction[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Inventory level list response interface
 */
export interface IInventoryLevelListResponse {
  data: IInventoryLevel[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Inventory filter parameters interface
 */
export interface IInventoryFilterParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  warehouseId?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}