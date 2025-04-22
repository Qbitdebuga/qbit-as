import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { JournalEntriesModule } from './journal-entries/journal-entries.module';
import { FinancialStatementsModule } from './financial-statements/financial-statements.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    // Import the PrismaModule for database access
    PrismaModule,
    // Import the AccountsModule for chart of accounts functionality
    AccountsModule,
    JournalEntriesModule,
    FinancialStatementsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 