import { Module } from '@nestjs/common';
import { JournalEntriesService } from './journal-entries.service.js';
import { JournalEntriesController } from './journal-entries.controller.js';
import { JournalEntriesRepository } from './journal-entries.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { EventsModule } from '../events/events.module.js';

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [JournalEntriesController],
  providers: [JournalEntriesService, JournalEntriesRepository],
  exports: [JournalEntriesService]
})
export class JournalEntriesModule {} 