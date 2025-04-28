import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { CreateProductCategoryDto } from './dto/create-product-category.dto.js';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto.js';
import { CreateProductVariantDto } from './dto/create-product-variant.dto.js';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto.js';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Product, ProductCategory, ProductVariant } from './entities/index.js';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'The product has been created successfully.', type: Product })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all products with pagination' })
  @ApiResponse({ status: 200, description: 'Returns a list of products.', type: [Product] })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (1-based)', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for name or SKU', type: String })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category ID', type: Number })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active status', type: Boolean })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('category') categoryId?: number,
    @Query('active') active?: boolean,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (categoryId) {
      where.categoryId = +categoryId;
    }
    
    if (active !== undefined) {
      where.isActive = active;
    }
    
    return this.productsService.findAllProducts({
      skip,
      take: limit,
      where,
      orderBy: { name: 'asc' }
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a product by ID' })
  @ApiResponse({ status: 200, description: 'Returns the product.', type: Product })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'id', type: 'number', description: 'Product ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOneProduct(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'The product has been updated successfully.', type: Product })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'id', type: 'number', description: 'Product ID' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'The product has been deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'id', type: 'number', description: 'Product ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.removeProduct(id);
  }

  // Product Variants
  @Post(':id/variants')
  @ApiOperation({ summary: 'Create a new product variant' })
  @ApiResponse({ status: 201, description: 'The variant has been created successfully.', type: ProductVariant })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'id', type: 'number', description: 'Product ID' })
  createVariant(
    @Param('id', ParseIntPipe) productId: number,
    @Body() createVariantDto: CreateProductVariantDto
  ) {
    return this.productsService.createVariant(productId, createVariantDto);
  }

  @Get(':id/variants')
  @ApiOperation({ summary: 'Retrieve all variants of a product' })
  @ApiResponse({ status: 200, description: 'Returns a list of product variants.', type: [ProductVariant] })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'id', type: 'number', description: 'Product ID' })
  findAllVariants(@Param('id', ParseIntPipe) productId: number) {
    return this.productsService.findAllVariants(productId);
  }

  @Get('variants/:id')
  @ApiOperation({ summary: 'Retrieve a product variant by ID' })
  @ApiResponse({ status: 200, description: 'Returns the product variant.', type: ProductVariant })
  @ApiResponse({ status: 404, description: 'Product variant not found.' })
  @ApiParam({ name: 'id', type: 'number', description: 'Variant ID' })
  findOneVariant(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOneVariant(id);
  }

  @Patch('variants/:id')
  @ApiOperation({ summary: 'Update a product variant' })
  @ApiResponse({ status: 200, description: 'The variant has been updated successfully.', type: ProductVariant })
  @ApiResponse({ status: 404, description: 'Product variant not found.' })
  @ApiParam({ name: 'id', type: 'number', description: 'Variant ID' })
  updateVariant(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVariantDto: UpdateProductVariantDto
  ) {
    return this.productsService.updateVariant(id, updateVariantDto);
  }

  @Delete('variants/:id')
  @ApiOperation({ summary: 'Delete a product variant' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'The variant has been deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product variant not found.' })
  @ApiParam({ name: 'id', type: 'number', description: 'Variant ID' })
  async removeVariant(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.removeVariant(id);
  }
}

@ApiTags('product-categories')
@Controller('product-categories')
export class ProductCategoriesController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product category' })
  @ApiResponse({ status: 201, description: 'The category has been created successfully.', type: ProductCategory })
  create(@Body() createCategoryDto: CreateProductCategoryDto) {
    return this.productsService.createCategory(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all product categories' })
  @ApiResponse({ status: 200, description: 'Returns a list of product categories.', type: [ProductCategory] })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (1-based)', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for name', type: String })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active status', type: Boolean })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('active') active?: boolean,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    
    if (active !== undefined) {
      where.isActive = active;
    }
    
    return this.productsService.findAllCategories({
      skip,
      take: limit,
      where,
      orderBy: { name: 'asc' }
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a product category by ID' })
  @ApiResponse({ status: 200, description: 'Returns the product category.', type: ProductCategory })
  @ApiResponse({ status: 404, description: 'Product category not found.' })
  @ApiParam({ name: 'id', type: 'number', description: 'Category ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOneCategory(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product category' })
  @ApiResponse({ status: 200, description: 'The category has been updated successfully.', type: ProductCategory })
  @ApiResponse({ status: 404, description: 'Product category not found.' })
  @ApiParam({ name: 'id', type: 'number', description: 'Category ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateProductCategoryDto
  ) {
    return this.productsService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product category' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'The category has been deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product category not found.' })
  @ApiParam({ name: 'id', type: 'number', description: 'Category ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.removeCategory(id);
  }
} 