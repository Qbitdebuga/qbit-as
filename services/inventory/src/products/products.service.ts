import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository.js';
import { ProductPublisher } from '../events/publishers/product-publisher.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { CreateProductCategoryDto } from './dto/create-product-category.dto.js';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto.js';
import { CreateProductVariantDto } from './dto/create-product-variant.dto.js';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly productPublisher: ProductPublisher
  ) {}

  // Product methods
  async createProduct(createProductDto: CreateProductDto) {
    const product = await this.productsRepository.createProduct(createProductDto);
    
    // Publish product created event
    await this.productPublisher.publishProductCreated(product.id, product);
    
    return product;
  }

  async findAllProducts(params: {
    skip?: number;
    take?: number;
    cursor?: { id: number } | { sku: string };
    where?: any;
    orderBy?: any;
  }) {
    return this.productsRepository.findAllProducts(params);
  }

  async findOneProduct(id: number) {
    const product = await this.productsRepository.findOneProduct(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async updateProduct(id: number, updateProductDto: UpdateProductDto) {
    await this.findOneProduct(id); // Check if product exists
    const updatedProduct = await this.productsRepository.updateProduct(id, updateProductDto);
    
    // Publish product updated event
    await this.productPublisher.publishProductUpdated(updatedProduct.id, updatedProduct);
    
    return updatedProduct;
  }

  async removeProduct(id: number) {
    await this.findOneProduct(id); // Check if product exists
    const removedProduct = await this.productsRepository.removeProduct(id);
    
    // Publish product deleted event
    await this.productPublisher.publishProductDeleted(id);
    
    return removedProduct;
  }

  // Product Category methods
  async createCategory(createCategoryDto: CreateProductCategoryDto) {
    return this.productsRepository.createCategory(createCategoryDto);
  }

  async findAllCategories(params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  }) {
    return this.productsRepository.findAllCategories(params);
  }

  async findOneCategory(id: number) {
    const category = await this.productsRepository.findOneCategory(id);
    if (!category) {
      throw new NotFoundException(`Product category with ID ${id} not found`);
    }
    return category;
  }

  async updateCategory(id: number, updateCategoryDto: UpdateProductCategoryDto) {
    await this.findOneCategory(id); // Check if category exists
    return this.productsRepository.updateCategory(id, updateCategoryDto);
  }

  async removeCategory(id: number) {
    await this.findOneCategory(id); // Check if category exists
    return this.productsRepository.removeCategory(id);
  }

  // Product Variant methods
  async createVariant(productId: number, createVariantDto: CreateProductVariantDto) {
    await this.findOneProduct(productId); // Check if product exists
    return this.productsRepository.createVariant(productId, createVariantDto);
  }

  async findAllVariants(productId: number) {
    await this.findOneProduct(productId); // Check if product exists
    return this.productsRepository.findAllVariants(productId);
  }

  async findOneVariant(id: number) {
    const variant = await this.productsRepository.findOneVariant(id);
    if (!variant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    }
    return variant;
  }

  async updateVariant(id: number, updateVariantDto: UpdateProductVariantDto) {
    await this.findOneVariant(id); // Check if variant exists
    return this.productsRepository.updateVariant(id, updateVariantDto);
  }

  async removeVariant(id: number) {
    await this.findOneVariant(id); // Check if variant exists
    return this.productsRepository.removeVariant(id);
  }
} 