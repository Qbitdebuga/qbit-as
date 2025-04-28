import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { EventsModule } from '../events/events.module.js';
import { AccountsModule } from '../accounts/accounts.module.js';
import { JournalEntryCreationSaga } from './journal-entry-creation.saga.js';
import { BatchProcessingSaga } from './batch-processing.saga.js';
import { HttpModule } from '@nestjs/axios';

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
    AccountsModule,
    HttpModule
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