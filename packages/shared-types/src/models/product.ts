/**
 * Product-related types shared across the application
 */

export interface IProduct {
  id: number;
  sku: string;
  name: string;
  description?: string;
  categoryId?: number;
  price: number;
  cost?: number;
  quantityOnHand: number;
  reorderPoint?: number;
  isActive: boolean;
  isSellable: boolean;
  isPurchasable: boolean;
  barcode?: string;
  weight?: number;
  weightUnit?: string;
  dimensions?: string;
  taxable: boolean;
  taxRateId?: number;
  accountId?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  category?: IProductCategory;
  variants?: IProductVariant[];
}

export interface IProductCategory {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  parent?: IProductCategory;
  children?: IProductCategory[];
  products?: IProduct[];
}

export interface IProductVariant {
  id: number;
  productId: number;
  sku: string;
  name: string;
  attributes?: Record<string, any>;
  price?: number;
  cost?: number;
  quantityOnHand: number;
  reorderPoint?: number;
  barcode?: string;
  weight?: number;
  weightUnit?: string;
  dimensions?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  product?: IProduct;
}

export interface IInventoryLevel {
  id: number;
  productId?: number;
  variantId?: number;
  warehouseId: number;
  locationId?: number;
  quantity: number;
  reorderPoint?: number;
  createdAt: Date;
  updatedAt: Date;
  product?: IProduct;
  variant?: IProductVariant;
}

export interface IProductListResponse {
  data: IProduct[];
  total: number;
  page: number;
  limit: number;
}

export interface IProductCategoryListResponse {
  data: IProductCategory[];
  total: number;
  page: number;
  limit: number;
}

export interface IProductFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface IProductVariantFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  orderBy?: string;
  order?: 'asc' | 'desc';
} 