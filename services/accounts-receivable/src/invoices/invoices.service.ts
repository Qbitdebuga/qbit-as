import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './entities/invoice.entity';
import { InvoiceStatus } from './entities/invoice-status.enum';
import { InvoiceListParamsDto } from './dto/invoice-list-params.dto';
import { CreateInvoicePaymentDto } from './dto/create-invoice-payment.dto';
import { InvoicePayment } from './entities/invoice-payment.entity';
import { PaymentStatus } from './entities/payment-status.enum';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    try {
      // Generate invoice number
      const invoiceCount = await (this.prisma as any).invoice.count();
      const invoiceNumber = `INV-${(invoiceCount + 1).toString().padStart(5, '0')}`;

      // Calculate totals
      const subtotal = createInvoiceDto.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );

      let taxAmount = 0;
      let discountAmount = 0;

      // Calculate tax and discount amounts from invoice items
      for (const item of createInvoiceDto.items) {
        const itemTotal = item.quantity * item.unitPrice;
        if (item.taxPercentage) {
          taxAmount += (itemTotal * item.taxPercentage) / 100;
        }
        if (item.discountPercentage) {
          discountAmount += (itemTotal * item.discountPercentage) / 100;
        }
      }

      const totalAmount = subtotal + taxAmount - discountAmount;
      const balanceDue = totalAmount; // Initially the balance due is the total amount

      // Create invoice and invoice items in a transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create the invoice with type casting to avoid TS errors
        const invoice = await (prisma as any).invoice.create({
          data: {
            invoiceNumber,
            customerId: createInvoiceDto.customerId,
            customerReference: createInvoiceDto.customerReference,
            invoiceDate: createInvoiceDto.invoiceDate,
            dueDate: createInvoiceDto.dueDate,
            status: createInvoiceDto.status || InvoiceStatus.DRAFT,
            subtotal,
            taxAmount,
            discountAmount,
            totalAmount,
            balanceDue,
            notes: createInvoiceDto.notes,
            terms: createInvoiceDto.terms,
          } as any,
        });

        // Create invoice items
        for (const item of createInvoiceDto.items) {
          const lineTotal = item.quantity * item.unitPrice * 
            (1 - (item.discountPercentage ? item.discountPercentage / 100 : 0)) * 
            (1 + (item.taxPercentage ? item.taxPercentage / 100 : 0));
          
          await (prisma as any).invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              itemCode: item.itemCode,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountPercentage: item.discountPercentage,
              taxPercentage: item.taxPercentage,
              lineTotal,
              notes: item.notes,
            },
          });
        }

        // Fetch the complete invoice with relationships
        return await (prisma as any).invoice.findUnique({
          where: { id: invoice.id },
          include: {
            items: true,
            payments: true,
          } as any,
        });
      });

      if (!result) {
        throw new Error('Failed to create invoice');
      }

      return result as unknown as Invoice;
    } catch (error: any) {
      this.logger.error(`Error creating invoice: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(params: InvoiceListParamsDto): Promise<{ data: Invoice[]; total: number; page: number; limit: number }> {
    try {
      const { page = 1, limit = 10, status, customerId, sortBy = 'createdAt' } = params;
      const skip = (page - 1) * limit;
      // Default to desc if not specified
      const sortDirection = (params as any)['sortOrder'] === 'asc' ? 'asc' : 'desc';

      // Build filter conditions
      const where: any = {};
      
      if (status) {
        where.status = status;
      }
      
      if (customerId) {
        where.customerId = customerId;
      }

      // Execute query with pagination
      const [invoices, total] = await Promise.all([
        (this.prisma as any).invoice.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortDirection,
          },
          include: {
            items: true,
            payments: true,
          } as any,
        }),
        (this.prisma as any).invoice.count({ where }),
      ]);

      return {
        data: invoices as unknown as Invoice[],
        total,
        page,
        limit,
      };
    } catch (error: any) {
      this.logger.error(`Error finding all invoices: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Invoice> {
    try {
      const invoice = await (this.prisma as any).invoice.findUnique({
        where: { id },
        include: {
          items: true,
          payments: true,
        } as any,
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }

      return invoice as unknown as Invoice;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding invoice ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    try {
      // First check if invoice exists
      const existingInvoice = await this.findOne(id);

      // Prevent updates for invoices that are not in DRAFT status
      if (existingInvoice.status !== InvoiceStatus.DRAFT && !updateInvoiceDto.status) {
        throw new BadRequestException(`Cannot update invoice that is not in DRAFT status`);
      }

      // Update the invoice with any field in the DTO
      const updateData: any = {};
      
      if (updateInvoiceDto.customerReference !== undefined) {
        updateData.customerReference = updateInvoiceDto.customerReference;
      }
      if (updateInvoiceDto.invoiceDate !== undefined) {
        updateData.invoiceDate = updateInvoiceDto.invoiceDate;
      }
      if (updateInvoiceDto.dueDate !== undefined) {
        updateData.dueDate = updateInvoiceDto.dueDate;
      }
      if (updateInvoiceDto.status !== undefined) {
        updateData.status = updateInvoiceDto.status;
      }
      if (updateInvoiceDto.notes !== undefined) {
        updateData.notes = updateInvoiceDto.notes;
      }
      if (updateInvoiceDto.terms !== undefined) {
        updateData.terms = updateInvoiceDto.terms;
      }
      
      await (this.prisma as any).invoice.update({
        where: { id },
        data: updateData,
      });

      // Return updated invoice with related data
      return this.findOne(id);
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error updating invoice ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // First check if invoice exists
      const existingInvoice = await this.findOne(id);

      // Prevent deletions for invoices that are not in DRAFT status
      if (existingInvoice.status !== InvoiceStatus.DRAFT) {
        throw new BadRequestException(`Cannot delete invoice that is not in DRAFT status`);
      }

      // Delete the invoice
      await (this.prisma as any).invoice.delete({
        where: { id },
      });
    } catch (error: any) {
      this.logger.error(`Error deleting invoice ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async finalize(id: string): Promise<Invoice> {
    try {
      // First check if invoice exists
      const existingInvoice = await this.findOne(id);

      // Prevent finalizing invoices that are not in DRAFT status
      if (existingInvoice.status !== InvoiceStatus.DRAFT) {
        throw new BadRequestException(`Cannot finalize invoice that is not in DRAFT status`);
      }

      // Update the invoice status to FINALIZED
      await (this.prisma as any).invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.FINALIZED,
        },
      });

      return this.findOne(id);
    } catch (error: any) {
      this.logger.error(`Error finalizing invoice ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async markAsSent(id: string): Promise<Invoice> {
    try {
      // First check if invoice exists
      const existingInvoice = await this.findOne(id);

      // Prevent marking as sent for invoices that are not in FINALIZED status
      if (existingInvoice.status !== InvoiceStatus.FINALIZED) {
        throw new BadRequestException(`Cannot mark as sent invoice that is not in FINALIZED status`);
      }

      // Update the invoice status to SENT
      await (this.prisma as any).invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.SENT,
        },
      });

      return this.findOne(id);
    } catch (error: any) {
      this.logger.error(`Error marking invoice ${id} as sent: ${error.message}`, error.stack);
      throw error;
    }
  }

  async voidInvoice(id: string): Promise<Invoice> {
    try {
      // First check if invoice exists
      const existingInvoice = await this.findOne(id);

      // Prevent voiding invoices that are already PAID, VOID, or if they have payments
      if (
        existingInvoice.status === InvoiceStatus.PAID ||
        existingInvoice.status === InvoiceStatus.VOID ||
        (existingInvoice.payments && existingInvoice.payments.length > 0)
      ) {
        throw new BadRequestException(`Cannot void invoice that is paid, already void, or has payments`);
      }

      // Update the invoice status to VOID
      await (this.prisma as any).invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.VOID,
        },
      });

      return this.findOne(id);
    } catch (error: any) {
      this.logger.error(`Error voiding invoice ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createPayment(createPaymentDto: CreateInvoicePaymentDto): Promise<InvoicePayment> {
    try {
      // Process the payment in a transaction to ensure data consistency
      return await this.prisma.$transaction(async (prisma) => {
        // 1. Get the invoice and check its status
        const invoice = await (prisma as any).invoice.findUnique({
          where: { id: createPaymentDto.invoiceId },
        });

        if (!invoice) {
          throw new NotFoundException(`Invoice with ID ${createPaymentDto.invoiceId} not found`);
        }

        if (invoice.status === InvoiceStatus.VOID) {
          throw new BadRequestException(`Cannot accept payment for voided invoice`);
        }

        if (invoice.status === InvoiceStatus.PAID) {
          throw new BadRequestException(`Invoice is already fully paid`);
        }

        if (invoice.status === InvoiceStatus.DRAFT) {
          throw new BadRequestException(`Cannot accept payment for invoice in draft status`);
        }

        // 2. Validate payment amount
        const remainingBalance = invoice.balanceDue;
        if (createPaymentDto.amount > remainingBalance) {
          throw new BadRequestException(`Payment amount exceeds remaining balance: ${remainingBalance}`);
        }

        // 3. Create the payment
        const payment = await (prisma as any).invoicePayment.create({
          data: {
            invoiceId: createPaymentDto.invoiceId,
            amount: createPaymentDto.amount,
            paymentDate: createPaymentDto.paymentDate || new Date(),
            paymentMethod: createPaymentDto.paymentMethod,
            referenceNumber: createPaymentDto.referenceNumber,
            notes: createPaymentDto.notes,
          },
        });

        // 4. Update invoice balance and potentially status
        const newBalance = remainingBalance - createPaymentDto.amount;
        const newStatus = newBalance <= 0 ? InvoiceStatus.PAID : invoice.status;

        await (prisma as any).invoice.update({
          where: { id: createPaymentDto.invoiceId },
          data: {
            balanceDue: newBalance,
            status: newStatus,
          },
        });

        return payment;
      });
    } catch (error: any) {
      this.logger.error(`Error creating payment: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPaymentsByInvoiceId(invoiceId: string): Promise<InvoicePayment[]> {
    try {
      // Check if invoice exists
      await this.findOne(invoiceId);

      // Get all payments for the invoice
      const payments = await (this.prisma as any).invoicePayment.findMany({
        where: { invoiceId },
        orderBy: { paymentDate: 'desc' },
      });

      return payments as unknown as InvoicePayment[];
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error getting payments for invoice ${invoiceId}: ${error.message}`, error.stack);
      throw error;
    }
  }
} 