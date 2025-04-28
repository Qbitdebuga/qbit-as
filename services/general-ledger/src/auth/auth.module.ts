import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service.js';

@Module({
  imports: [ConfigModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
