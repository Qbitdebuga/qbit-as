import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Type assertion for direct model access
  // @ts-ignore - Ignore type checking for these properties
  get warehouse() { return this.warehouse; }
  
  // @ts-ignore
  get warehouseLocation() { return this.warehouseLocation; }
  
  // @ts-ignore
  get inventoryTransaction() { return this.inventoryTransaction; }
  
  // @ts-ignore
  get transactionLine() { return this.transactionLine; }
  
  // @ts-ignore
  get product() { return this.product; }
  
  // @ts-ignore
  get productCategory() { return this.productCategory; }
  
  // @ts-ignore
  get productVariant() { return this.productVariant; }
  
  // @ts-ignore
  get inventoryLevel() { return this.inventoryLevel; }
} 