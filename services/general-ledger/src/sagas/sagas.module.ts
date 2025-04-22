import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';
import { AccountsModule } from '../accounts/accounts.module';
import { JournalEntryCreationSaga } from './journal-entry-creation.saga';
import { BatchProcessingSaga } from './batch-processing.saga';

/**
 * Sagas Module
 * 
 * This module handles complex business transactions that span multiple steps and may
 * require coordination across services. The saga pattern is used to maintain data
 * consistency across services through compensating transactions.
 */
@Module({
  imports: [
    PrismaModule,
    EventsModule,
    AccountsModule
  ],
  providers: [
    JournalEntryCreationSaga,
    BatchProcessingSaga
  ],
  exports: [
    JournalEntryCreationSaga,
    BatchProcessingSaga
  ]
})
export class SagasModule {} 