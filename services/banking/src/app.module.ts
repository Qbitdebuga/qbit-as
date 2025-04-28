import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AccountsModule } from './accounts/accounts.module.js';
import { HealthModule } from './health/health.module.js';
import { EventsModule } from './events/events.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AccountsModule,
    HealthModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 