import { Module } from '@nestjs/common';
import { TokenService } from './services/token.service';
import { AuthController } from './controllers/auth.controller';
import { CsrfGuard } from './guards/csrf.guard';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [TokenService, CsrfGuard],
  exports: [TokenService],
})
export class AuthModule {} 