import { AxiosInstance } from 'axios';
import { 
  IProduct, 
  IProductCategory, 
  IProductVariant, 
  IProductListResponse, 
  IProductCategoryListResponse,
  IProductFilterParams,
  IProductVariantFilterParams
} from '@qbit/shared-types';

export class ProductsClient {
  private basePath = '/products';
  private categoriesPath = '/product-categories';

  constructor(private readonly http: AxiosInstance) {}

  // Product methods
  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    const response = await this?.http.post(this.basePath, data);
    return response.data;
  }

  async getProducts(params?: IProductFilterParams): Promise<IProductListResponse> {
    const response = await this?.http.get(this.basePath, { params });
    return response.data;
  }

  async getProduct(id: number): Promise<IProduct> {
    const response = await this?.http.get(`${this.basePath}/${id}`);
    return response.data;
  }

  async updateProduct(id: number, data: Partial<IProduct>): Promise<IProduct> {
    const response = await this?.http.patch(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: number): Promise<void> {
    await this?.http.delete(`${this.basePath}/${id}`);
  }

  // Product Category methods
  async createCategory(data: Partial<IProductCategory>): Promise<IProductCategory> {
    const response = await this?.http.post(this.categoriesPath, data);
    return response.data;
  }

  async getCategories(params?: IProductFilterParams): Promise<IProductCategoryListResponse> {
    const response = await this?.http.get(this.categoriesPath, { params });
    return response.data;
  }

  async getCategory(id: number): Promise<IProductCategory> {
    const response = await this?.http.get(`${this.categoriesPath}/${id}`);
    return response.data;
  }

  async updateCategory(id: number, data: Partial<IProductCategory>): Promise<IProductCategory> {
    const response = await this?.http.patch(`${this.categoriesPath}/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await this?.http.delete(`${this.categoriesPath}/${id}`);
  }

  // Product Variant methods
  async createVariant(productId: number, data: Partial<IProductVariant>): Promise<IProductVariant> {
    const response = await this?.http.post(`${this.basePath}/${productId}/variants`, data);
    return response.data;
  }

  async getVariants(productId: number, params?: IProductVariantFilterParams): Promise<IProductVariant[]> {
    const response = await this?.http.get(`${this.basePath}/${productId}/variants`, { params });
    return response.data;
  }

  async getVariant(id: number): Promise<IProductVariant> {
    const response = await this?.http.get(`${this.basePath}/variants/${id}`);
    return response.data;
  }

  async updateVariant(id: number, data: Partial<IProductVariant>): Promise<IProductVariant> {
    const response = await this?.http.patch(`${this.basePath}/variants/${id}`, data);
    return response.data;
  }

  async deleteVariant(id: number): Promise<void> {
    await this?.http.delete(`${this.basePath}/variants/${id}`);
  }
}