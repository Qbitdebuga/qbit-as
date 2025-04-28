export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  categoryId?: string;
  category?: ProductCategory;
  images?: ProductImage[];
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  isActive: boolean;
  isTaxable: boolean;
  taxRate?: number;
  inventoryTracking: boolean;
  quantityOnHand?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: ProductCategory;
  children?: ProductCategory[];
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductAttribute {
  id: string;
  productId: string;
  name: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name?: string;
  price?: number;
  cost?: number;
  attributes: ProductVariantAttribute[];
  inventoryTracking: boolean;
  quantityOnHand?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariantAttribute {
  id: string;
  variantId: string;
  name: string;
  value: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  categoryId?: string;
  isActive?: boolean;
  isTaxable?: boolean;
  taxRate?: number;
  inventoryTracking?: boolean;
  quantityOnHand?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  attributes?: Omit<ProductAttribute, 'id' | 'productId' | 'createdAt' | 'updatedAt'>[];
  images?: Omit<ProductImage, 'id' | 'productId' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateProductDto {
  sku?: string;
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  categoryId?: string;
  isActive?: boolean;
  isTaxable?: boolean;
  taxRate?: number;
  inventoryTracking?: boolean;
  quantityOnHand?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface CreateProductCategoryDto {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateProductCategoryDto {
  name?: string;
  description?: string;
  parentId?: string;
}

export interface ProductFilters {
  isActive?: boolean;
  categoryId?: string;
  inventoryTracking?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ProductWithTotal {
  totalCount: number;
  products: Product[];
} 