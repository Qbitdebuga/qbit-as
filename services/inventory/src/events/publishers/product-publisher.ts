import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export interface ProductEvent {
  serviceSource: string | null;
  entityType: string | null;
  timestamp: Date;
  action: 'created' | 'updated' | 'deleted';
  id: number | null;
  data?: any;
}

@Injectable()
export class ProductPublisher {
  constructor(
    @Inject('INVENTORY_SERVICE') private readonly client: ClientProxy,
  ) {}

  async publishProductCreated(productId: number, productData: any): Promise<void> {
    const event: ProductEvent = {
      serviceSource: 'inventory',
      entityType: 'product',
      timestamp: new Date(),
      action: 'created',
      id: productId,
      data: productData,
    };

    await this?.client.emit('product.created', event).toPromise();
  }

  async publishProductUpdated(productId: number, productData: any): Promise<void> {
    const event: ProductEvent = {
      serviceSource: 'inventory',
      entityType: 'product',
      timestamp: new Date(),
      action: 'updated',
      id: productId,
      data: productData,
    };

    await this?.client.emit('product.updated', event).toPromise();
  }

  async publishProductDeleted(productId: number): Promise<void> {
    const event: ProductEvent = {
      serviceSource: 'inventory',
      entityType: 'product',
      timestamp: new Date(),
      action: 'deleted',
      id: productId,
    };

    await this?.client.emit('product.deleted', event).toPromise();
  }
} 