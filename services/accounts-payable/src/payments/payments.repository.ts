import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto, UpdatePaymentDto } from './dto';

@Injectable()
export class PaymentsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePaymentDto): Promise<Payment> {
    // Generate payment number if not provided
    if (!data.paymentNumber) {
      const lastPayment = await (this.prisma as any).payment.findFirst({
        orderBy: { id: 'desc' },
      });
      
      // Generate a new payment number if none exist
      const nextNumber = lastPayment && lastPayment.paymentNumber 
        ? parseInt(lastPayment.paymentNumber.split('-')[1]) + 1 
        : 1;
      data.paymentNumber = `PAY-${nextNumber.toString().padStart(5, '0')}`;
    }
    
    // Create payment with nested applications
    return (this.prisma as any).payment.create({
      data: {
        paymentNumber: data.paymentNumber,
        vendorId: data.vendorId,
        paymentDate: new Date(data.paymentDate),
        amount: data.amount.toString(),
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        memo: data.memo,
        status: data.status || PaymentStatus.PENDING,
        bankAccountId: data.bankAccountId,
        applications: {
          create: data.applications.map(app => ({
            billId: app.billId,
            amount: app.amount.toString(),
          })),
        },
      },
      include: {
        applications: true,
        vendor: true,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: any;
    where?: any;
    orderBy?: any;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    
    const [data, total] = await Promise.all([
      (this.prisma as any).payment.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        include: {
          vendor: true,
          applications: {
            include: {
              bill: true,
            },
          },
        },
      }),
      (this.prisma as any).payment.count({ where }),
    ]);
    
    return {
      data,
      total,
      page: skip ? Math.floor(skip / take) + 1 : 1,
      limit: take || 10,
    };
  }

  async findOne(id: number): Promise<Payment> {
    return (this.prisma as any).payment.findUnique({
      where: { id },
      include: {
        vendor: true,
        applications: {
          include: {
            bill: true,
          },
        },
      },
    });
  }

  async update(id: number, data: UpdatePaymentDto): Promise<Payment> {
    return (this.prisma as any).payment.update({
      where: { id },
      data: {
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
        amount: data.amount ? data.amount.toString() : undefined,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        memo: data.memo,
        status: data.status,
        bankAccountId: data.bankAccountId,
      },
      include: {
        applications: true,
        vendor: true,
      },
    });
  }

  async remove(id: number): Promise<Payment> {
    return (this.prisma as any).payment.delete({
      where: { id },
      include: {
        applications: true,
      },
    });
  }
  
  async applyPayment(paymentId: number, applications: { billId: number; amount: number }[]): Promise<Payment> {
    // Create transaction to ensure atomicity
    return (this.prisma as any).$transaction(async (prisma) => {
      // First, delete existing applications for this payment
      await (prisma as any).paymentApplication.deleteMany({
        where: { paymentId },
      });
      
      // Then, create new applications
      for (const app of applications) {
        await (prisma as any).paymentApplication.create({
          data: {
            paymentId,
            billId: app.billId,
            amount: app.amount.toString(),
          },
        });
        
        // Update the bill's amountPaid and balanceDue
        const bill = await (prisma as any).bill.findUnique({
          where: { id: app.billId },
        });
        
        if (bill) {
          const newAmountPaid = parseFloat(bill.amountPaid.toString()) + app.amount;
          const newBalanceDue = parseFloat(bill.totalAmount.toString()) - newAmountPaid;
          
          await (prisma as any).bill.update({
            where: { id: app.billId },
            data: {
              amountPaid: newAmountPaid.toString(),
              balanceDue: newBalanceDue.toString(),
              status: newBalanceDue <= 0 ? 'PAID' : newAmountPaid > 0 ? 'PARTIAL' : bill.status,
            },
          });
        }
      }
      
      // Return the updated payment with applications
      return (prisma as any).payment.findUnique({
        where: { id: paymentId },
        include: {
          applications: {
            include: {
              bill: true,
            },
          },
          vendor: true,
        },
      });
    });
  }
  
  async findByVendor(vendorId: number): Promise<Payment[]> {
    return (this.prisma as any).payment.findMany({
      where: { vendorId },
      include: {
        applications: {
          include: {
            bill: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
  }
} 