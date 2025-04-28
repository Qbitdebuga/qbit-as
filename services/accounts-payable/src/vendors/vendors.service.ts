import { Injectable, NotFoundException } from '@nestjs/common';
import { VendorsRepository } from './vendors.repository';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorDto } from './dto/vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private readonly vendorsRepository: VendorsRepository) {}

  async create(createVendorDto: CreateVendorDto): Promise<VendorDto> {
    return this?.vendorsRepository.create(createVendorDto);
  }

  async findAll(): Promise<VendorDto[]> {
    return this?.vendorsRepository.findAll();
  }

  async findOne(id: number): Promise<VendorDto> {
    const vendor = await this?.vendorsRepository.findOne(id);
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    return vendor;
  }

  async update(id: number, updateVendorDto: UpdateVendorDto): Promise<VendorDto> {
    const existingVendor = await this?.vendorsRepository.findOne(id);
    if (!existingVendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    return this?.vendorsRepository.update(id, updateVendorDto);
  }

  async remove(id: number): Promise<void> {
    const existingVendor = await this?.vendorsRepository.findOne(id);
    if (!existingVendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    return this?.vendorsRepository.remove(id);
  }
}
