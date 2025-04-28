import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthClientService } from './auth-client.service';
import { GeneralLedgerClientService } from './general-ledger-client.service';
import { InventoryClientService } from './inventory-client.service';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [AuthClientService, GeneralLedgerClientService, InventoryClientService],
  exports: [AuthClientService, GeneralLedgerClientService, InventoryClientService],
})
export class ClientsModule {}
