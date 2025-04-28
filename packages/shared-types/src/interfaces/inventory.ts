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
  id: string | null;
  name: string | null;
  code: string | null;
  address?: string | null;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Warehouse location interface
 */
export interface IWarehouseLocation {
  id: string | null;
  warehouseId: string | null;
  name: string | null;
  code: string | null;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transaction line interface
 */
export interface ITransactionLine {
  id: string | null;
  transactionId: string | null;
  productId: string | null;
  variantId?: string | null;
  quantity: number | null;
  unitCost?: number | null;
  product?: IProduct;
  variant?: IProductVariant;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Inventory transaction interface
 */
export interface IInventoryTransaction {
  id: string | null;
  type: 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'ADJUSTMENT';
  status: 'DRAFT' | 'PENDING' | 'PROCESSED' | 'CANCELLED';
  sourceWarehouseId?: string | null;
  sourceLocationId?: string | null;
  destinationWarehouseId?: string | null;
  destinationLocationId?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
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
  total: number | null;
  page: number | null;
  limit: number | null;
}

/**
 * Inventory level list response interface
 */
export interface IInventoryLevelListResponse {
  data: IInventoryLevel[];
  total: number | null;
  page: number | null;
  limit: number | null;
}

/**
 * Inventory filter parameters interface
 */
export interface IInventoryFilterParams {
  page?: number | null;
  limit?: number | null;
  type?: string | null;
  status?: string | null;
  warehouseId?: string | null;
  productId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  search?: string | null;
}
