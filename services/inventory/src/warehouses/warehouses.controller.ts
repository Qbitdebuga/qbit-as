import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseEntity } from './entities/warehouse.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('warehouses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'The warehouse has been successfully created.',
    type: WarehouseEntity 
  })
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this?.warehousesService.create(createWarehouseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all warehouses' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns all warehouses',
    type: [WarehouseEntity] 
  })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('searchTerm') searchTerm?: string,
    @Query('orderBy') orderBy?: string,
    @Query('includeInactive') includeInactive?: string | boolean,
  ) {
    return this?.warehousesService.findAll({
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      searchTerm,
      orderBy,
      includeInactive: includeInactive === true || includeInactive === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a warehouse by id' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns the warehouse with the specified id',
    type: WarehouseEntity 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Warehouse not found' })
  findOne(@Param('id') id: string) {
    return this?.warehousesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a warehouse' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'The warehouse has been successfully updated.',
    type: WarehouseEntity 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Warehouse not found' })
  update(@Param('id') id: string, @Body() updateWarehouseDto: UpdateWarehouseDto) {
    return this?.warehousesService.update(id, updateWarehouseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a warehouse' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'The warehouse has been successfully deleted.',
    type: WarehouseEntity 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Warehouse not found' })
  remove(@Param('id') id: string) {
    return this?.warehousesService.remove(id);
  }
}