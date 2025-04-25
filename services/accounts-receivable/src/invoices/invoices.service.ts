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
      const invoiceCount = await this.prisma.invoice.count();
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
        const invoice = await prisma.invoice.create({
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
        return await prisma.invoice.findUnique({
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
        this.prisma.invoice.findMany({
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
        this.prisma.invoice.count({ where }),
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
      const invoice = await this.prisma.invoice.findUnique({
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
      
      await this.prisma.invoice.update({
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

      // Prevent deletion for invoices that are not in DRAFT status
      if (existingInvoice.status !== InvoiceStatus.DRAFT) {
        throw new BadRequestException(`Cannot delete invoice that is not in DRAFT status`);
      }

      // Delete the invoice (items will cascade delete)
      await this.prisma.invoice.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error removing invoice ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async finalize(id: string): Promise<Invoice> {
    try {
      // First check if invoice exists
      const existingInvoice = await this.findOne(id);

      // Only draft invoices can be finalized
      if (existingInvoice.status !== InvoiceStatus.DRAFT) {
        throw new BadRequestException(`Only DRAFT invoices can be finalized`);
      }

      // Update status to PENDING
      await this.prisma.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.PENDING,
        } as any,
      });

      // Return updated invoice
      return this.findOne(id);
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error finalizing invoice ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async markAsSent(id: string): Promise<Invoice> {
    try {
      // First check if invoice exists
      const existingInvoice = await this.findOne(id);

      // Only pending invoices can be marked as sent
      if (existingInvoice.status !== InvoiceStatus.PENDING) {
        throw new BadRequestException(`Only PENDING invoices can be marked as sent`);
      }

      // Update status to SENT
      await this.prisma.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.SENT,
        } as any,
      });

      // Return updated invoice
      return this.findOne(id);
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error marking invoice ${id} as sent: ${error.message}`, error.stack);
      throw error;
    }
  }

  async voidInvoice(id: string): Promise<Invoice> {
    try {
      // First check if invoice exists
      const existingInvoice = await this.findOne(id);

      // Cannot void invoices that are already paid or void
      if ([InvoiceStatus.PAID, InvoiceStatus.VOID].includes(existingInvoice.status)) {
        throw new BadRequestException(`Cannot void an invoice that is ${existingInvoice.status}`);
      }

      // Update status to VOID
      await this.prisma.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.VOID,
        } as any,
      });

      // Return updated invoice
      return this.findOne(id);
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error voiding invoice ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createPayment(createPaymentDto: CreateInvoicePaymentDto): Promise<InvoicePayment> {
    try {
      // First check if invoice exists
      const invoice = await this.findOne(createPaymentDto.invoiceId);

      // Cannot add payments to draft, void, or cancelled invoices
      if ([InvoiceStatus.DRAFT, InvoiceStatus.VOID, InvoiceStatus.CANCELLED].includes(invoice.status)) {
        throw new BadRequestException(`Cannot add payment to an invoice with ${invoice.status} status`);
      }

      // Create the payment
      const newPaymentResult = await this.prisma.$transaction(async (prisma) => {
        // Create the payment record
        const newPayment = await (prisma as any).invoicePayment.create({
          data: {
            invoiceId: createPaymentDto.invoiceId,
            paymentDate: createPaymentDto.paymentDate,
            amount: createPaymentDto.amount,
            paymentMethod: createPaymentDto.paymentMethod,
            status: (createPaymentDto as any).status || PaymentStatus.COMPLETED,
            referenceNumber: createPaymentDto.referenceNumber,
            notes: createPaymentDto.notes,
          },
        });

        // Update the invoice balance if payment is completed
        if (newPayment.status === PaymentStatus.COMPLETED) {
          const newAmountPaid = invoice.amountPaid + newPayment.amount;
          const newBalanceDue = invoice.totalAmount - newAmountPaid;

          // Determine new invoice status based on payment amount
          let newStatus = invoice.status;
          if (newBalanceDue <= 0) {
            newStatus = InvoiceStatus.PAID;
          } else if (newAmountPaid > 0) {
            newStatus = InvoiceStatus.PARTIAL;
          }

          // Update the invoice with new amounts and status
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              amountPaid: newAmountPaid,
              balanceDue: newBalanceDue,
              status: newStatus,
            } as any,
          });
        }

        return newPayment;
      });

      return newPaymentResult as unknown as InvoicePayment;
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error creating payment for invoice ${createPaymentDto.invoiceId}: ${error.message}`, error.stack);
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