import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
// import { UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BatchService } from './batch.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { JournalEntryBatchCreate } from '@qbit/shared-types';
// import { ServiceAuthGuard } from '../auth/guards/service-auth.guard';
// import { RequireServiceScope } from '../auth/decorators/service-scope.decorator';

@Controller('batch')
@ApiTags('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post()
  // @UseGuards(ServiceAuthGuard)
  // @RequireServiceScope('general-ledger:write')
  create(@Body() createBatchDto: CreateBatchDto) {
    return this.batchService.create(createBatchDto);
  }

  @Get()
  // @UseGuards(ServiceAuthGuard)
  // @RequireServiceScope('general-ledger:read')
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('type') type?: string
  ): Promise<any> {
    return this.batchService.findAll(
      status,
      type,
      undefined,
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 10
    );
  }

  @Get(':id')
  // @UseGuards(ServiceAuthGuard)
  // @RequireServiceScope('general-ledger:read')
  findOne(@Param('id') id: string) {
    return this.batchService.findOne(id);
  }

  @Post('journal-entries')
  // @UseGuards(ServiceAuthGuard)
  // @RequireServiceScope('general-ledger:write')
  async createJournalEntryBatch(@Body() data: JournalEntryBatchCreate) {
    return this.batchService.create(data);
  }

  @Post(':id/process')
  // @UseGuards(ServiceAuthGuard)
  async processBatch(@Param('id') id: string) {
    return this.batchService.process(id);
  }

  @Post(':id/cancel')
  // @UseGuards(ServiceAuthGuard)
  // @RequireServiceScope('general-ledger:write')
  async cancel(@Param('id') id: string) {
    return this.batchService.cancel(id);
  }
} 