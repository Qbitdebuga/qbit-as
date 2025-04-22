import { Module } from '@nestjs/common';
import { JournalEntriesService } from './journal-entries.service';
import { JournalEntriesController } from './journal-entries.controller';
import { JournalEntriesRepository } from './journal-entries.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JournalEntriesController],
  providers: [JournalEntriesService, JournalEntriesRepository],
  exports: [JournalEntriesService]
})
export class JournalEntriesModule {} 