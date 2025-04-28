import { Module } from '@nestjs/common';
import { VendorsController } from './vendors.controller.js';
import { VendorsService } from './vendors.service.js';
import { VendorsRepository } from './vendors.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [VendorsController],
  providers: [VendorsService, VendorsRepository],
  exports: [VendorsService],
})
export class VendorsModule {} 