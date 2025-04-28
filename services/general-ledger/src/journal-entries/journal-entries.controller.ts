import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { JournalEntriesService } from './journal-entries.service.js';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto.js';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto.js';

@Controller('journal-entries')
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  create(@Body() createJournalEntryDto: CreateJournalEntryDto) {
    return this.journalEntriesService.create(createJournalEntryDto);
  }

  @Get()
  findAll() {
    return this.journalEntriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.journalEntriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJournalEntryDto: UpdateJournalEntryDto) {
    return this.journalEntriesService.update(id, updateJournalEntryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.journalEntriesService.remove(id);
  }

  @Post(':id/post')
  post(@Param('id') id: string) {
    return this.journalEntriesService.post(id);
  }

  @Post(':id/reverse')
  reverse(@Param('id') id: string) {
    return this.journalEntriesService.reverse(id);
  }
} 