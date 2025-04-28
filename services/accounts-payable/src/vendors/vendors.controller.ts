import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VendorsService } from './vendors.service.js';
import { CreateVendorDto } from './dto/create-vendor.dto.js';
import { UpdateVendorDto } from './dto/update-vendor.dto.js';
import { VendorDto } from './dto/vendor.dto.js';

@ApiTags('vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor created successfully', type: VendorDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createVendorDto: CreateVendorDto): Promise<VendorDto> {
    return this.vendorsService.create(createVendorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vendors' })
  @ApiResponse({ status: 200, description: 'Return all vendors', type: [VendorDto] })
  async findAll(): Promise<VendorDto[]> {
    return this.vendorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vendor by id' })
  @ApiResponse({ status: 200, description: 'Return a vendor by id', type: VendorDto })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async findOne(@Param('id') id: string): Promise<VendorDto> {
    return this.vendorsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vendor' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully', type: VendorDto })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ): Promise<VendorDto> {
    return this.vendorsService.update(+id, updateVendorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vendor' })
  @ApiResponse({ status: 200, description: 'Vendor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.vendorsService.remove(+id);
  }
} 