import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AssetsModule } from './assets/assets.module.js';
import { DepreciationModule } from './depreciation/depreciation.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { AuthModule } from './auth/auth.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AssetsModule,
    DepreciationModule,
    CategoriesModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {} 