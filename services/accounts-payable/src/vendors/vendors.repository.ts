import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorDto } from './dto/vendor.dto';
import { Vendor } from '@prisma/client';

@Injectable()
export class VendorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVendorDto: CreateVendorDto): Promise<VendorDto> {
    const vendor = await this.prisma.vendor.create({
      data: createVendorDto,
    });
    
    return this.mapToDto(vendor);
  }

  async findAll(): Promise<VendorDto[]> {
    const vendors = await this.prisma.vendor.findMany();
    return vendors.map(vendor => this.mapToDto(vendor));
  }

  async findOne(id: number): Promise<VendorDto | null> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
    });
    
    if (!vendor) {
      return null;
    }
    
    return this.mapToDto(vendor);
  }

  async update(id: number, updateVendorDto: UpdateVendorDto): Promise<VendorDto> {
    const vendor = await this.prisma.vendor.update({
      where: { id },
      data: updateVendorDto,
    });
    
    return this.mapToDto(vendor);
  }

  async remove(id: number): Promise<void> {
    await this.prisma.vendor.delete({
      where: { id },
    });
  }

  private mapToDto(vendor: Vendor): VendorDto {
    return {
      id: vendor.id.toString(),
      vendorNumber: vendor.vendorNumber,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      zipCode: vendor.zipCode,
      country: vendor.country,
      taxId: vendor.taxId,
      website: vendor.website,
      notes: vendor.notes,
      isActive: vendor.isActive,
      paymentTerms: vendor.paymentTerms,
      defaultAccountId: vendor.defaultAccountId?.toString(),
      creditLimit: vendor.creditLimit?.toString(),
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    };
  }
} 