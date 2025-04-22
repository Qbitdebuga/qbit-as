import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { BatchService } from './batch.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { JournalEntryBatchCreate } from '@qbit/shared-types';
import { ServiceAuthGuard } from '../auth/guards/service-auth.guard';
import { RequireServiceScope } from '../auth/decorators/service-scope.decorator';

@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post()
  @UseGuards(ServiceAuthGuard)
  @RequireServiceScope('general-ledger:write')
  async create(@Body() createBatchDto: CreateBatchDto) {
    return this.batchService.create(createBatchDto as JournalEntryBatchCreate);
  }

  @Get()
  @UseGuards(ServiceAuthGuard)
  @RequireServiceScope('general-ledger:read')
  async findAll(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.batchService.findAll(skip || 0, take || 10);
  }

  @Get(':id')
  @UseGuards(ServiceAuthGuard)
  @RequireServiceScope('general-ledger:read')
  async findOne(@Param('id') id: string) {
    return this.batchService.findOne(id);
  }

  @Post(':id/process')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(ServiceAuthGuard)
  @RequireServiceScope('general-ledger:write')
  async process(@Param('id') id: string) {
    return this.batchService.process(id);
  }

  @Post(':id/cancel')
  @UseGuards(ServiceAuthGuard)
  @RequireServiceScope('general-ledger:write')
  async cancel(@Param('id') id: string) {
    return this.batchService.cancel(id);
  }
} 