import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateCustomerContactDto } from './dto/create-customer-contact.dto';
import { Customer, CustomerContact } from '@prisma/client';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly customersRepository: CustomersRepository) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // If customer number is provided, check if it already exists
    if (createCustomerDto.customerNumber) {
      const existing = await this.customersRepository.findByCustomerNumber(createCustomerDto.customerNumber);
      if (existing) {
        throw new ConflictException(`Customer with number ${createCustomerDto.customerNumber} already exists`);
      }
    }
    
    try {
      return await this.customersRepository.create(createCustomerDto);
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Failed to create customer: ${err.message}`, err.stack);
      throw error;
    }
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Promise<{ data: Customer[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, isActive, sortBy = 'createdAt', sortDirection = 'desc' } = params;
    
    const skip = (page - 1) * limit;
    const take = limit;
    
    let orderBy: any = {};
    orderBy[sortBy] = sortDirection;
    
    try {
      const result = await this.customersRepository.findAll({
        skip,
        take,
        search,
        isActive,
        orderBy,
      });
      
      return {
        ...result,
        page,
        limit,
      };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Failed to retrieve customers: ${err.message}`, err.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne(id);
    
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    
    return customer;
  }

  async findByCustomerNumber(customerNumber: string): Promise<Customer> {
    const customer = await this.customersRepository.findByCustomerNumber(customerNumber);
    
    if (!customer) {
      throw new NotFoundException(`Customer with number ${customerNumber} not found`);
    }
    
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    // Check if customer exists
    await this.findOne(id);
    
    try {
      return await this.customersRepository.update(id, updateCustomerDto);
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Failed to update customer: ${err.message}`, err.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<Customer> {
    // Check if customer exists
    await this.findOne(id);
    
    try {
      return await this.customersRepository.remove(id);
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Failed to delete customer: ${err.message}`, err.stack);
      throw error;
    }
  }

  async createContact(customerId: string, createContactDto: CreateCustomerContactDto): Promise<CustomerContact> {
    // Check if customer exists
    await this.findOne(customerId);
    
    try {
      return await this.customersRepository.createContact(customerId, createContactDto);
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Failed to create customer contact: ${err.message}`, err.stack);
      throw error;
    }
  }

  async updateContact(id: string, updateContactDto: Partial<CreateCustomerContactDto>): Promise<CustomerContact> {
    try {
      return await this.customersRepository.updateContact(id, updateContactDto);
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Failed to update customer contact: ${err.message}`, err.stack);
      throw error;
    }
  }

  async removeContact(id: string): Promise<CustomerContact> {
    try {
      return await this.customersRepository.removeContact(id);
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Failed to delete customer contact: ${err.message}`, err.stack);
      throw error;
    }
  }
} 