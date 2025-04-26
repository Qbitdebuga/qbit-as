import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  // Product methods
  async createProduct(data: CreateProductDto) {
    // Generate SKU if not provided
    if (!data.sku) {
      const lastProduct = await (this.prisma as any).product.findFirst({
        orderBy: { id: 'desc' },
      });
      
      const nextId = lastProduct ? lastProduct.id + 1 : 1;
      data.sku = `PROD-${nextId.toString().padStart(5, '0')}`;
    }

    return (this.prisma as any).product.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        cost: data.cost,
        quantityOnHand: data.quantityOnHand || 0,
        reorderPoint: data.reorderPoint,
        isActive: data.isActive ?? true,
        isSellable: data.isSellable ?? true,
        isPurchasable: data.isPurchasable ?? true,
        barcode: data.barcode,
        weight: data.weight,
        weightUnit: data.weightUnit,
        dimensions: data.dimensions,
        taxable: data.taxable ?? true,
        taxRateId: data.taxRateId,
        accountId: data.accountId,
        imageUrl: data.imageUrl,
      },
      include: {
        category: true,
        variants: true,
      },
    });
  }

  async findAllProducts(params: {
    skip?: number;
    take?: number;
    cursor?: any;
    where?: any;
    orderBy?: any;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    
    const [data, total] = await Promise.all([
      (this.prisma as any).product.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        include: {
          category: true,
        },
      }),
      (this.prisma as any).product.count({ where }),
    ]);
    
    return {
      data,
      total,
      page: skip ? Math.floor(skip / take) + 1 : 1,
      limit: take || 10,
    };
  }

  async findOneProduct(id: number) {
    return (this.prisma as any).product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        inventoryLevels: true,
      },
    });
  }

  async findProductBySku(sku: string) {
    return (this.prisma as any).product.findUnique({
      where: { sku },
      include: {
        category: true,
        variants: true,
        inventoryLevels: true,
      },
    });
  }

  async updateProduct(id: number, data: UpdateProductDto) {
    return (this.prisma as any).product.update({
      where: { id },
      data,
      include: {
        category: true,
        variants: true,
      },
    });
  }

  async removeProduct(id: number) {
    return (this.prisma as any).product.delete({
      where: { id },
    });
  }

  // Product Category methods
  async createCategory(data: CreateProductCategoryDto) {
    return (this.prisma as any).productCategory.create({
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        isActive: data.isActive ?? true,
        imageUrl: data.imageUrl,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAllCategories(params: {
    skip?: number;
    take?: number;
    cursor?: any;
    where?: any;
    orderBy?: any;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    
    const [data, total] = await Promise.all([
      (this.prisma as any).productCategory.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        include: {
          parent: true,
          children: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      (this.prisma as any).productCategory.count({ where }),
    ]);
    
    return {
      data,
      total,
      page: skip ? Math.floor(skip / take) + 1 : 1,
      limit: take || 10,
    };
  }

  async findOneCategory(id: number) {
    return (this.prisma as any).productCategory.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: {
          take: 10,
          orderBy: { name: 'asc' },
          select: {
            id: true,
            sku: true,
            name: true,
            price: true,
            quantityOnHand: true,
          },
        },
      },
    });
  }

  async updateCategory(id: number, data: UpdateProductCategoryDto) {
    return (this.prisma as any).productCategory.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async removeCategory(id: number) {
    // Check if there are products in this category
    const productCount = await (this.prisma as any).product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      // If products exist, just mark as inactive instead of deleting
      return (this.prisma as any).productCategory.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return (this.prisma as any).productCategory.delete({
      where: { id },
    });
  }

  // Product Variant methods
  async createVariant(productId: number, data: CreateProductVariantDto) {
    // Get the parent product
    const product = await (this.prisma as any).product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Generate SKU if not provided
    let sku = data.sku;
    if (!sku) {
      const variantCount = await (this.prisma as any).productVariant.count({
        where: { productId },
      });
      sku = `${product.sku}-V${(variantCount + 1).toString().padStart(2, '0')}`;
    }

    return (this.prisma as any).productVariant.create({
      data: {
        productId,
        sku,
        name: data.name,
        attributes: data.attributes,
        price: data.price,
        cost: data.cost,
        quantityOnHand: data.quantityOnHand || 0,
        reorderPoint: data.reorderPoint,
        barcode: data.barcode,
        weight: data.weight,
        weightUnit: data.weightUnit,
        dimensions: data.dimensions,
        imageUrl: data.imageUrl,
        isActive: data.isActive ?? true,
      },
      include: {
        product: true,
      },
    });
  }

  async findAllVariants(productId: number) {
    return (this.prisma as any).productVariant.findMany({
      where: { productId },
      orderBy: { name: 'asc' },
    });
  }

  async findOneVariant(id: number) {
    return (this.prisma as any).productVariant.findUnique({
      where: { id },
      include: {
        product: true,
        inventoryLevels: true,
      },
    });
  }

  async findVariantBySku(sku: string) {
    return (this.prisma as any).productVariant.findUnique({
      where: { sku },
      include: {
        product: true,
        inventoryLevels: true,
      },
    });
  }

  async updateVariant(id: number, data: UpdateProductVariantDto) {
    return (this.prisma as any).productVariant.update({
      where: { id },
      data,
      include: {
        product: true,
      },
    });
  }

  async removeVariant(id: number) {
    return (this.prisma as any).productVariant.delete({
      where: { id },
    });
  }
} 