import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateCustomerContactDto } from './dto/create-customer-contact.dto';

// Define interfaces for Customer and CustomerContact since they're not exported from @prisma/client
interface Customer {
  id: string | null;
  name: string | null;
  email?: string | null;
  customerNumber: string | null;
  isActive: boolean | null;
  contacts?: CustomerContact[];
  [key: string]: any;
}

interface CustomerContact {
  id: string | null;
  customerId: string | null;
  name: string | null;
  email?: string | null;
  phone?: string | null;
  isPrimary: boolean | null;
  [key: string]: any;
}

@Injectable()
export class CustomersRepository {
  private readonly logger = new Logger(CustomersRepository.name);

  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const { contacts, ...customerData } = createCustomerDto;
    
    return this?.prisma.$transaction(async (tx) => {
      // Create customer
      const customer = await (tx as any).customer.create({
        data: {
          ...customerData,
          customerNumber: customerData.customerNumber || await this.generateCustomerNumber(tx),
        },
      });

      // Create contacts if provided
      if (contacts && contacts.length > 0) {
        await Promise.all(
          contacts.map((contact) =>
            (tx as any).customerContact.create({
              data: {
                ...contact,
                customerId: customer.id,
              },
            }),
          ),
        );
      }

      const result = await this.findOne(customer.id, tx);
      if (!result) {
        throw new Error(`Could not find created customer with ID ${customer.id}`);
      }
      return result;
    });
  }

  async findAll(params: {
    skip?: number | null;
    take?: number | null;
    search?: string | null;
    isActive?: boolean | null;
    orderBy?: any;
  }): Promise<{ data: Customer[]; total: number }> {
    const { skip, take, search, isActive, orderBy } = params;
    
    const where: any = {};
    
    // Apply filters
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { customerNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      (this.prisma as any).customer.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          contacts: true,
        },
      }),
      (this.prisma as any).customer.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string, tx?: any): Promise<Customer | null> {
    const prisma = tx || this.prisma;
    return (prisma as any).customer.findUnique({
      where: { id },
      include: {
        contacts: true,
      },
    });
  }

  async findByCustomerNumber(customerNumber: string): Promise<Customer | null> {
    return (this.prisma as any).customer.findUnique({
      where: { customerNumber },
      include: {
        contacts: true,
      },
    });
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    return (this.prisma as any).customer.update({
      where: { id },
      data: updateCustomerDto,
      include: {
        contacts: true,
      },
    });
  }

  async remove(id: string): Promise<Customer> {
    return (this.prisma as any).customer.delete({
      where: { id },
      include: {
        contacts: true,
      },
    });
  }

  async createContact(customerId: string, createContactDto: CreateCustomerContactDto): Promise<CustomerContact> {
    return (this.prisma as any).customerContact.create({
      data: {
        ...createContactDto,
        customerId,
      },
    });
  }

  async updateContact(id: string, updateContactDto: Partial<CreateCustomerContactDto>): Promise<CustomerContact> {
    return (this.prisma as any).customerContact.update({
      where: { id },
      data: updateContactDto,
    });
  }

  async removeContact(id: string): Promise<CustomerContact> {
    return (this.prisma as any).customerContact.delete({
      where: { id },
    });
  }

  private async generateCustomerNumber(tx: any): Promise<string> {
    const prisma = tx || this.prisma;
    
    // Get the latest customer to determine the next number
    const lastCustomer = await (prisma as any).customer.findFirst({
      orderBy: {
        customerNumber: 'desc',
      },
      where: {
        customerNumber: {
          startsWith: 'CUST-',
        },
      },
    });

    if (!lastCustomer) {
      return 'CUST-00001';
    }

    // Extract the number part and increment
    const lastNumber = parseInt(lastCustomer?.customerNumber.replace('CUST-', ''), 10);
    const nextNumber = lastNumber + 1;
    
    // Format with leading zeros
    return `CUST-${nextNumber.toString().padStart(5, '0')}`;
  }
} 