import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';
import { ClientsModule } from '../clients/clients.module.js';

@Module({
  imports: [ClientsModule],
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class GuardsModule {} 