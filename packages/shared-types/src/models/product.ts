/**
 * Product-related types shared across the application
 */

export interface IProduct {
  id: number | null;
  sku: string | null;
  name: string | null;
  description?: string | null;
  categoryId?: number | null;
  price: number | null;
  cost?: number | null;
  quantityOnHand: number | null;
  reorderPoint?: number | null;
  isActive: boolean | null;
  isSellable: boolean | null;
  isPurchasable: boolean | null;
  barcode?: string | null;
  weight?: number | null;
  weightUnit?: string | null;
  dimensions?: string | null;
  taxable: boolean | null;
  taxRateId?: number | null;
  accountId?: number | null;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: IProductCategory;
  variants?: IProductVariant[];
}

export interface IProductCategory {
  id: number | null;
  name: string | null;
  description?: string | null;
  parentId?: number | null;
  isActive: boolean | null;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  parent?: IProductCategory;
  children?: IProductCategory[];
  products?: IProduct[];
}

export interface IProductVariant {
  id: number | null;
  productId: number | null;
  sku: string | null;
  name: string | null;
  attributes?: Record<string, any>;
  price?: number | null;
  cost?: number | null;
  quantityOnHand: number | null;
  reorderPoint?: number | null;
  barcode?: string | null;
  weight?: number | null;
  weightUnit?: string | null;
  dimensions?: string | null;
  imageUrl?: string | null;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  product?: IProduct;
}

export interface IInventoryLevel {
  id: number | null;
  productId?: number | null;
  variantId?: number | null;
  warehouseId: number | null;
  locationId?: number | null;
  quantity: number | null;
  reorderPoint?: number | null;
  createdAt: Date;
  updatedAt: Date;
  product?: IProduct;
  variant?: IProductVariant;
}

export interface IProductListResponse {
  data: IProduct[];
  total: number | null;
  page: number | null;
  limit: number | null;
}

export interface IProductCategoryListResponse {
  data: IProductCategory[];
  total: number | null;
  page: number | null;
  limit: number | null;
}

export interface IProductFilterParams {
  page?: number | null;
  limit?: number | null;
  search?: string | null;
  categoryId?: number | null;
  isActive?: boolean | null;
  orderBy?: string | null;
  order?: 'asc' | 'desc';
}

export interface IProductVariantFilterParams {
  page?: number | null;
  limit?: number | null;
  search?: string | null;
  isActive?: boolean | null;
  orderBy?: string | null;
  order?: 'asc' | 'desc';
} 