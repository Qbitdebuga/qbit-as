import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApplyPaymentDto } from './dto/apply-payment.dto';
import { InvoiceStatus } from '../invoices/entities/invoice-status.enum';
import { PaymentMethod } from '../invoices/entities/payment-method.enum';
import { PaymentStatus } from '../invoices/entities/payment-status.enum';
import { Invoice } from '../invoices/entities/invoice.entity';

// Define the InvoicePayment type based on the Prisma schema
type InvoicePayment = {
  id: string;
  invoiceId: string;
  paymentDate: Date;
  amount: number;
  paymentMethod: string;
  status: PaymentStatus;
  referenceNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PaymentsRepository {
  private readonly logger = new Logger(PaymentsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      const { invoiceId, ...paymentData } = createPaymentDto;
      
      // Start a transaction to create the payment and update the invoice
      const payment = await this.prisma.$transaction(async (tx) => {
        // Create the payment
        const newPayment = await tx.invoicePayment.create({
          data: {
            invoiceId,
            ...paymentData,
            status: PaymentStatus.PENDING,
          },
        });

        // Get the invoice to check its current balance
        const invoice = await tx.invoice.findUnique({
          where: { id: invoiceId },
          select: { 
            id: true, 
            totalAmount: true, 
            amountPaid: true, 
            status: true 
          },
        });

        if (!invoice) {
          throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }

        // Update the invoice balance
        const updatedAmountPaid = (invoice.amountPaid || 0) + paymentData.amount;
        
        // Determine the new invoice status based on the updated amount
        let newStatus = invoice.status;
        if (updatedAmountPaid >= invoice.totalAmount) {
          newStatus = InvoiceStatus.PAID;
        } else if (updatedAmountPaid > 0) {
          newStatus = InvoiceStatus.PARTIAL;
        }

        // Update the invoice
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            amountPaid: updatedAmountPaid,
            status: newStatus,
          },
        });

        return newPayment;
      });

      return this.mapToEntity(payment);
    } catch (error: any) {
      this.logger.error(`Failed to create payment: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create payment', error.message);
    }
  }

  async findAll(): Promise<Payment[]> {
    try {
      const payments = await this.prisma.invoicePayment.findMany({
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              customerId: true,
              totalAmount: true,
            },
          },
        },
      });
      
      return payments.map(payment => this.mapToEntity(payment));
    } catch (error: any) {
      this.logger.error(`Failed to fetch payments: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch payments', error.message);
    }
  }

  async findOne(id: string): Promise<Payment> {
    try {
      const payment = await this.prisma.invoicePayment.findUnique({
        where: { id },
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              customerId: true,
              totalAmount: true,
            },
          },
        },
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }

      return this.mapToEntity(payment);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch payment: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch payment', error.message);
    }
  }

  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    try {
      const payments = await this.prisma.invoicePayment.findMany({
        where: { invoiceId },
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              customerId: true,
              totalAmount: true,
            },
          },
        },
      });
      
      return payments.map(payment => this.mapToEntity(payment));
    } catch (error: any) {
      this.logger.error(`Failed to fetch payments for invoice ${invoiceId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to fetch payments for invoice ${invoiceId}`, error.message);
    }
  }

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment> {
    try {
      const payment = await this.prisma.invoicePayment.update({
        where: { id },
        data: { status },
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              customerId: true,
              totalAmount: true,
            },
          },
        },
      });
      
      return this.mapToEntity(payment);
    } catch (error: any) {
      this.logger.error(`Failed to update payment status: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update payment status', error.message);
    }
  }

  async deletePayment(id: string): Promise<void> {
    try {
      // Start a transaction to delete the payment and update the invoice
      await this.prisma.$transaction(async (tx) => {
        // Get the payment first to get the invoice ID and amount
        const payment = await tx.invoicePayment.findUnique({
          where: { id },
          select: { 
            id: true, 
            invoiceId: true, 
            amount: true,
            status: true
          },
        });

        if (!payment) {
          throw new NotFoundException(`Payment with ID ${id} not found`);
        }

        // Only allow deletion of pending payments
        if (payment.status !== PaymentStatus.PENDING) {
          throw new Error(`Cannot delete payment with status ${payment.status}`);
        }

        // Delete the payment
        await tx.invoicePayment.delete({
          where: { id },
        });

        // If the payment was associated with an invoice, update the invoice
        if (payment.invoiceId) {
          // Get the invoice to check its current balance
          const invoice = await tx.invoice.findUnique({
            where: { id: payment.invoiceId },
            select: { 
              id: true, 
              totalAmount: true, 
              amountPaid: true, 
              status: true 
            },
          });

          if (invoice) {
            // Update the invoice balance by subtracting the payment amount
            const updatedAmountPaid = Math.max(0, (invoice.amountPaid || 0) - payment.amount);
            
            // Determine the new invoice status based on the updated amount
            let newStatus = invoice.status;
            if (updatedAmountPaid <= 0) {
              newStatus = InvoiceStatus.PENDING;
            } else if (updatedAmountPaid < invoice.totalAmount) {
              newStatus = InvoiceStatus.PARTIAL;
            }

            // Update the invoice
            await tx.invoice.update({
              where: { id: payment.invoiceId },
              data: {
                amountPaid: updatedAmountPaid,
                status: newStatus,
              },
            });
          }
        }
      });
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete payment: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete payment', error.message);
    }
  }

  async getInvoiceWithPayments(invoiceId: string): Promise<Invoice | null> {
    try {
      this.logger.log(`Getting invoice ${invoiceId} with its payments`);
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          customer: true,
          items: true,
          payments: true,
        },
      });

      if (!invoice) {
        return null;
      }

      return this.mapPrismaInvoiceToEntity(invoice);
    } catch (error: any) {
      this.logger.error(`Error getting invoice with payments: ${error.message}`, error);
      throw error;
    }
  }

  private async updateInvoiceBalances(tx: any, invoiceId: string, amountApplied: number) {
    try {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId }
      });

      if (!invoice) {
        throw new Error(`Invoice with ID ${invoiceId} not found`);
      }

      // Calculate new amounts
      const newAmountPaid = invoice.amountPaid + amountApplied;
      const newBalanceDue = invoice.totalAmount - newAmountPaid;

      // Determine new status based on payment amount
      const newStatus = this.calculateInvoiceStatus(newBalanceDue, invoice.totalAmount);

      // Update the invoice
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: newAmountPaid,
          balanceDue: newBalanceDue,
          status: newStatus,
        }
      });

      return true;
    } catch (error: any) {
      this.logger.error(`Error updating invoice balances for invoice ${invoiceId}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to update invoice balances: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private calculateInvoiceStatus(balanceDue: number, totalAmount: number): InvoiceStatus {
    if (balanceDue <= 0) {
      return InvoiceStatus.PAID;
    } else if (balanceDue < totalAmount) {
      return InvoiceStatus.PARTIAL;
    } else {
      return InvoiceStatus.PENDING;
    }
  }

  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus): Promise<Invoice> {
    try {
      this.logger.log(`Updating invoice ${invoiceId} status to ${status}`);
      const updatedInvoice = await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { status },
        include: {
          customer: true,
          items: true,
          payments: true,
        }
      });
      
      return this.mapPrismaInvoiceToEntity(updatedInvoice);
    } catch (error: any) {
      this.logger.error(`Error updating invoice status: ${error.message}`, error);
      throw error;
    }
  }

  async applyPayment(dto: ApplyPaymentDto): Promise<Payment> {
    try {
      // Start a transaction to apply the payment to the invoice
      const result = await this.prisma.$transaction(async (tx) => {
        // Get the payment
        const payment = await tx.invoicePayment.findUnique({
          where: { id: dto.paymentId },
        });

        if (!payment) {
          throw new NotFoundException(`Payment with ID ${dto.paymentId} not found`);
        }

        // Get the invoice
        const invoice = await tx.invoice.findUnique({
          where: { id: dto.invoiceId },
          select: { 
            id: true, 
            totalAmount: true, 
            amountPaid: true, 
            status: true 
          },
        });

        if (!invoice) {
          throw new NotFoundException(`Invoice with ID ${dto.invoiceId} not found`);
        }

        // Update the payment status
        const updatedPayment = await tx.invoicePayment.update({
          where: { id: dto.paymentId },
          data: { 
            status: PaymentStatus.COMPLETED,
            invoiceId: dto.invoiceId
          },
          include: {
            invoice: {
              select: {
                id: true,
                invoiceNumber: true,
                customerId: true,
                totalAmount: true,
              },
            },
          },
        });

        // Calculate new amount paid
        const updatedAmountPaid = (invoice.amountPaid || 0) + dto.amountApplied;
        
        // Determine the new invoice status based on the updated amount
        let newStatus = invoice.status;
        if (updatedAmountPaid >= invoice.totalAmount) {
          newStatus = InvoiceStatus.PAID;
        } else if (updatedAmountPaid > 0) {
          newStatus = InvoiceStatus.PARTIAL;
        }

        // Update the invoice
        await tx.invoice.update({
          where: { id: dto.invoiceId },
          data: {
            amountPaid: updatedAmountPaid,
            status: newStatus,
          },
        });

        return updatedPayment;
      });

      return this.mapToEntity(result);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to apply payment: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to apply payment', error.message);
    }
  }

  async getPaymentsByVendorId(vendorId: number): Promise<Payment[]> {
    // Since this is the accounts receivable service, this method is likely misplaced
    // and should be in the accounts payable service instead
    // For now, we'll just return all payments
    this.logger.warn(`getPaymentsByVendorId called with vendor ID ${vendorId} in accounts-receivable - this may be misplaced functionality`);
    return this.findAll();
  }

  private mapToEntity(prismaPayment: any): Payment {
    const payment = new Payment({
      id: prismaPayment.id,
      invoiceId: prismaPayment.invoiceId,
      paymentDate: prismaPayment.paymentDate,
      amount: prismaPayment.amount,
      paymentMethod: prismaPayment.paymentMethod as PaymentMethod,
      status: prismaPayment.status as PaymentStatus,
      referenceNumber: prismaPayment.referenceNumber,
      notes: prismaPayment.notes,
      createdAt: prismaPayment.createdAt,
      updatedAt: prismaPayment.updatedAt,
    });

    if (prismaPayment.invoice) {
      payment.invoice = {
        id: prismaPayment.invoice.id,
        invoiceNumber: prismaPayment.invoice.invoiceNumber,
        customerName: prismaPayment.invoice.customer ? prismaPayment.invoice.customer.name : '',
        totalAmount: prismaPayment.invoice.totalAmount,
        balanceDue: prismaPayment.invoice.balanceDue,
        status: prismaPayment.invoice.status
      };
    }

    return payment;
  }

  private mapPrismaInvoiceToEntity(prismaInvoice: any): Invoice {
    const invoice = {
      id: prismaInvoice.id,
      invoiceNumber: prismaInvoice.invoiceNumber,
      customerId: prismaInvoice.customerId,
      customerName: prismaInvoice.customer ? prismaInvoice.customer.name : '',
      customerReference: prismaInvoice.customerReference,
      invoiceDate: prismaInvoice.invoiceDate,
      dueDate: prismaInvoice.dueDate,
      status: prismaInvoice.status as InvoiceStatus,
      subtotal: Number(prismaInvoice.subtotal),
      taxAmount: prismaInvoice.taxAmount ? Number(prismaInvoice.taxAmount) : undefined,
      discountAmount: prismaInvoice.discountAmount ? Number(prismaInvoice.discountAmount) : undefined,
      totalAmount: Number(prismaInvoice.totalAmount),
      amountPaid: Number(prismaInvoice.amountPaid),
      balanceDue: Number(prismaInvoice.balanceDue),
      notes: prismaInvoice.notes,
      terms: prismaInvoice.terms,
      createdAt: prismaInvoice.createdAt,
      updatedAt: prismaInvoice.updatedAt,
    } as Invoice;

    if (prismaInvoice.items) {
      invoice.items = prismaInvoice.items.map((item: any) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal
      }));
    }

    if (prismaInvoice.payments) {
      invoice.payments = prismaInvoice.payments.map((payment: any) => ({
        id: payment.id,
        paymentDate: payment.paymentDate,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        referenceNumber: payment.referenceNumber
      }));
    }

    return invoice;
  }
} 