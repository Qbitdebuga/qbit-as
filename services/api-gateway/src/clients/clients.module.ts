import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthClientService } from './auth-client.service';
import { GeneralLedgerClientService } from './general-ledger-client.service';

@Module({
  imports: [ConfigModule],
  providers: [
    AuthClientService,
    GeneralLedgerClientService
  ],
  exports: [
    AuthClientService,
    GeneralLedgerClientService
  ],
})
export class ClientsModule {} 