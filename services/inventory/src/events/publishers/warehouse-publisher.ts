import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export interface WarehouseEvent {
  serviceSource: string;
  entityType: string;
  timestamp: Date;
  action: 'created' | 'updated' | 'deleted';
  id: string;
  data?: any;
}

@Injectable()
export class WarehousePublisher {
  constructor(
    @Inject('INVENTORY_SERVICE') private readonly client: ClientProxy,
  ) {}

  async publishWarehouseCreated(warehouseId: string, warehouseData: any): Promise<void> {
    const event: WarehouseEvent = {
      serviceSource: 'inventory',
      entityType: 'warehouse',
      timestamp: new Date(),
      action: 'created',
      id: warehouseId,
      data: warehouseData,
    };

    await this.client.emit('warehouse.created', event).toPromise();
  }

  async publishWarehouseUpdated(warehouseId: string, warehouseData: any): Promise<void> {
    const event: WarehouseEvent = {
      serviceSource: 'inventory',
      entityType: 'warehouse',
      timestamp: new Date(),
      action: 'updated',
      id: warehouseId,
      data: warehouseData,
    };

    await this.client.emit('warehouse.updated', event).toPromise();
  }

  async publishWarehouseDeleted(warehouseId: string): Promise<void> {
    const event: WarehouseEvent = {
      serviceSource: 'inventory',
      entityType: 'warehouse',
      timestamp: new Date(),
      action: 'deleted',
      id: warehouseId,
    };

    await this.client.emit('warehouse.deleted', event).toPromise();
  }
} 