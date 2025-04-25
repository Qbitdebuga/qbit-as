import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
  
  // TODO: Remove these properties once Prisma properly recognizes the models
  
  get vendor() {
    return this.vendor || {};
  }
  
  get bill() {
    return this.bill || {};
  }
  
  get payment() {
    return this.payment || {};
  }
  
  get expense() {
    return this.expense || {};
  }
  
  get expenseCategory() {
    return this.expenseCategory || {};
  }
  
  get expenseAttachment() {
    return this.expenseAttachment || {};
  }
  
  get expenseTag() {
    return this.expenseTag || {};
  }
  
  get paymentApplication() {
    return this.paymentApplication || {};
  }
} 