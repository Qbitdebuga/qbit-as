import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service.js';
import { AccountsController } from './accounts.controller.js';
import { AccountsRepository } from './accounts.repository.js';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from '../events/events.module.js';

@Module({
  imports: [AuthModule, PrismaModule, ConfigModule, EventsModule],
  controllers: [AccountsController],
  providers: [AccountsService, AccountsRepository],
  exports: [AccountsService, AccountsRepository],
})
export class AccountsModule {} 