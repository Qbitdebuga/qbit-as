import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionPublisher } from '../events/publishers/transaction-publisher';
import { 
  InventoryTransactionWhereInput, 
  InventoryTransactionOrderByWithRelationInput,
  InventoryTransactionUpdateInput,
  QueryMode,
  SortOrder 
} from '../prisma/prisma.types';
import { CreateTransactionDto, TransactionStatus, TransactionType } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ProcessTransactionDto } from './dto/process-transaction.dto';
import { ProcessTransactionLineDto } from './dto/process-transaction-line.dto';
import { TransactionLineStatus } from './dto/create-transaction-line.dto';

interface FindAllOptions {
  skip?: number;
  take?: number;
  searchTerm?: string;
  orderBy?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  sourceWarehouseId?: string;
  targetWarehouseId?: string;
  referenceType?: string;
  referenceId?: string;
  fromDate?: Date;
  toDate?: Date;
}

// Update the ProcessTransactionLineDto interface if it doesn't include the expirationDate property
interface ProcessTransactionLineWithExpirationDto extends ProcessTransactionLineDto {
  expirationDate?: string;
}

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionPublisher: TransactionPublisher
  ) {}
  
  // Helper to safely access Prisma models
  private get db() {
    return this.prisma as any;
  }

  async create(createTransactionDto: CreateTransactionDto) {
    try {
      // Validate warehouse IDs
      if (createTransactionDto.targetWarehouseId) {
        const targetWarehouse = await this.db.warehouse.findUnique({
          where: { id: createTransactionDto.targetWarehouseId }
        });
        if (!targetWarehouse) {
          throw new NotFoundException(`Target warehouse with ID ${createTransactionDto.targetWarehouseId} not found`);
        }
      }

      if (createTransactionDto.sourceWarehouseId) {
        const sourceWarehouse = await this.db.warehouse.findUnique({
          where: { id: createTransactionDto.sourceWarehouseId }
        });
        if (!sourceWarehouse) {
          throw new NotFoundException(`Source warehouse with ID ${createTransactionDto.sourceWarehouseId} not found`);
        }
      }

      // Type-specific validations
      switch (createTransactionDto.transactionType) {
        case TransactionType.RECEIPT:
          if (!createTransactionDto.targetWarehouseId) {
            throw new BadRequestException('Target warehouse is required for receipt transactions');
          }
          break;
        case TransactionType.SHIPMENT:
          if (!createTransactionDto.sourceWarehouseId) {
            throw new BadRequestException('Source warehouse is required for shipment transactions');
          }
          break;
        case TransactionType.TRANSFER:
          if (!createTransactionDto.sourceWarehouseId || !createTransactionDto.targetWarehouseId) {
            throw new BadRequestException('Both source and target warehouses are required for transfer transactions');
          }
          if (createTransactionDto.sourceWarehouseId === createTransactionDto.targetWarehouseId) {
            throw new BadRequestException('Source and target warehouses must be different for transfers');
          }
          break;
        case TransactionType.ADJUSTMENT:
          if (!createTransactionDto.targetWarehouseId) {
            throw new BadRequestException('Target warehouse is required for adjustment transactions');
          }
          break;
        case TransactionType.COUNT:
          if (!createTransactionDto.targetWarehouseId) {
            throw new BadRequestException('Target warehouse is required for count transactions');
          }
          break;
      }

      // Validate line items
      if (!createTransactionDto.lines || createTransactionDto.lines.length === 0) {
        throw new BadRequestException('At least one line item is required');
      }

      for (const line of createTransactionDto.lines) {
        // At least one product or variant must be specified
        if (!line.productId && !line.variantId) {
          throw new BadRequestException('Each line item must specify either a product or variant');
        }

        // Location validations for transfers
        if (createTransactionDto.transactionType === TransactionType.TRANSFER) {
          if (line.sourceLocationId) {
            const sourceLocation = await this.db.warehouseLocation.findUnique({
              where: { id: line.sourceLocationId }
            });
            if (!sourceLocation) {
              throw new NotFoundException(`Source location with ID ${line.sourceLocationId} not found`);
            }
            if (sourceLocation.warehouseId !== createTransactionDto.sourceWarehouseId) {
              throw new BadRequestException(`Source location does not belong to the source warehouse`);
            }
          }

          if (line.targetLocationId) {
            const targetLocation = await this.db.warehouseLocation.findUnique({
              where: { id: line.targetLocationId }
            });
            if (!targetLocation) {
              throw new NotFoundException(`Target location with ID ${line.targetLocationId} not found`);
            }
            if (targetLocation.warehouseId !== createTransactionDto.targetWarehouseId) {
              throw new BadRequestException(`Target location does not belong to the target warehouse`);
            }
          }
        }
      }

      // Create the transaction
      const createdTransaction = await this.db.inventoryTransaction.create({
        data: {
          transactionType: createTransactionDto.transactionType,
          referenceNumber: createTransactionDto.referenceNumber,
          referenceType: createTransactionDto.referenceType,
          referenceId: createTransactionDto.referenceId,
          sourceWarehouseId: createTransactionDto.sourceWarehouseId,
          targetWarehouseId: createTransactionDto.targetWarehouseId,
          transactionDate: createTransactionDto.transactionDate 
            ? new Date(createTransactionDto.transactionDate) 
            : new Date(),
          status: TransactionStatus.DRAFT,
          notes: createTransactionDto.notes,
          isBackordered: createTransactionDto.isBackordered || false,
          createdBy: 'system', // To be replaced with authenticated user ID
          lines: {
            create: createTransactionDto.lines.map(line => ({
              productId: line.productId,
              variantId: line.variantId,
              sourceLocationId: line.sourceLocationId,
              targetLocationId: line.targetLocationId,
              expectedQuantity: line.expectedQuantity,
              processedQuantity: line.processedQuantity || 0,
              status: line.status || TransactionLineStatus.PENDING,
              notes: line.notes,
              lotNumber: line.lotNumber,
              serialNumber: line.serialNumber,
              expirationDate: line.expirationDate ? new Date(line.expirationDate) : null,
              unitCost: line.unitCost
            }))
          }
        },
        include: {
          lines: true,
          sourceWarehouse: true,
          targetWarehouse: true
        }
      });

      // Publish transaction created event
      await this.transactionPublisher.publishTransactionCreated(
        createdTransaction.id,
        createdTransaction.transactionType as TransactionType,
        createdTransaction
      );

      return createdTransaction;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      console.error('Error creating transaction', error);
      throw new BadRequestException('Failed to create inventory transaction');
    }
  }

  async findAll(options: FindAllOptions = {}) {
    try {
      const { 
        skip = 0, 
        take = 10, 
        searchTerm, 
        orderBy, 
        type, 
        status,
        sourceWarehouseId,
        targetWarehouseId,
        referenceType,
        referenceId,
        fromDate,
        toDate 
      } = options;
      
      const where: InventoryTransactionWhereInput = {};
      
      // Apply filters
      if (searchTerm) {
        where.OR = [
          { referenceNumber: { contains: searchTerm, mode: QueryMode.insensitive } },
          { notes: { contains: searchTerm, mode: QueryMode.insensitive } },
        ];
      }
      
      if (type) {
        where.transactionType = type;
      }
      
      if (status) {
        where.status = status;
      }
      
      if (sourceWarehouseId) {
        where.sourceWarehouseId = sourceWarehouseId;
      }
      
      if (targetWarehouseId) {
        where.targetWarehouseId = targetWarehouseId;
      }
      
      if (referenceType) {
        where.referenceType = referenceType;
      }
      
      if (referenceId) {
        where.referenceId = referenceId;
      }
      
      // Handle date filtering
      let dateFilter = {};
      
      if (fromDate) {
        dateFilter = { gte: fromDate };
      }
      
      if (toDate) {
        dateFilter = { ...dateFilter, lte: toDate };
      }
      
      if (Object.keys(dateFilter).length > 0) {
        where.transactionDate = dateFilter;
      }
      
      // Apply ordering
      let orderByClause: InventoryTransactionOrderByWithRelationInput = { 
        transactionDate: SortOrder.desc 
      };
      
      if (orderBy) {
        const [field, direction] = orderBy.split(':');
        orderByClause = {
          [field]: direction === 'desc' ? SortOrder.desc : SortOrder.asc,
        };
      }

      // Execute query
      const [transactions, total] = await Promise.all([
        this.db.inventoryTransaction.findMany({
          where,
          skip,
          take,
          orderBy: orderByClause,
          include: {
            sourceWarehouse: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            targetWarehouse: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            _count: {
              select: {
                lines: true
              }
            }
          }
        }),
        this.db.inventoryTransaction.count({ where })
      ]);

      return {
        data: transactions,
        meta: {
          total,
          skip,
          take
        }
      };
    } catch (error) {
      console.error('Error finding transactions', error);
      throw new BadRequestException('Failed to retrieve inventory transactions');
    }
  }

  async findOne(id: string) {
    const transaction = await this.db.inventoryTransaction.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            },
            sourceLocation: true,
            targetLocation: true
          }
        },
        sourceWarehouse: true,
        targetWarehouse: true
      }
    });

    if (!transaction) {
      throw new NotFoundException(`Inventory transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    // Verify the transaction exists
    const existingTransaction = await this.findOne(id);
    
    // Only draft transactions can be updated
    if (existingTransaction.status !== TransactionStatus.DRAFT) {
      throw new ConflictException('Only draft transactions can be updated');
    }

    try {
      // Update the transaction data
      const transactionData: InventoryTransactionUpdateInput = {
        referenceNumber: updateTransactionDto.referenceNumber,
        referenceType: updateTransactionDto.referenceType,
        referenceId: updateTransactionDto.referenceId,
        transactionDate: updateTransactionDto.transactionDate 
          ? new Date(updateTransactionDto.transactionDate) 
          : undefined,
        notes: updateTransactionDto.notes,
        isBackordered: updateTransactionDto.isBackordered
      };

      // Handle warehouse changes
      if (updateTransactionDto.sourceWarehouseId !== undefined) {
        if (updateTransactionDto.sourceWarehouseId) {
          const sourceWarehouse = await this.db.warehouse.findUnique({
            where: { id: updateTransactionDto.sourceWarehouseId }
          });
          if (!sourceWarehouse) {
            throw new NotFoundException(`Source warehouse with ID ${updateTransactionDto.sourceWarehouseId} not found`);
          }
        }
        transactionData.sourceWarehouse = updateTransactionDto.sourceWarehouseId 
          ? { connect: { id: updateTransactionDto.sourceWarehouseId } } 
          : { disconnect: true };
      }

      if (updateTransactionDto.targetWarehouseId !== undefined) {
        if (updateTransactionDto.targetWarehouseId) {
          const targetWarehouse = await this.db.warehouse.findUnique({
            where: { id: updateTransactionDto.targetWarehouseId }
          });
          if (!targetWarehouse) {
            throw new NotFoundException(`Target warehouse with ID ${updateTransactionDto.targetWarehouseId} not found`);
          }
        }
        transactionData.targetWarehouse = updateTransactionDto.targetWarehouseId 
          ? { connect: { id: updateTransactionDto.targetWarehouseId } } 
          : { disconnect: true };
      }

      // Update the transaction
      const updatedTransaction = await this.db.inventoryTransaction.update({
        where: { id },
        data: transactionData,
        include: {
          lines: true,
          sourceWarehouse: true,
          targetWarehouse: true
        }
      });

      return updatedTransaction;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      console.error('Error updating transaction', error);
      throw new BadRequestException('Failed to update inventory transaction');
    }
  }

  async remove(id: string) {
    // Verify the transaction exists
    const existingTransaction = await this.findOne(id);
    
    // Only draft transactions can be deleted
    if (existingTransaction.status !== TransactionStatus.DRAFT) {
      throw new ConflictException('Only draft transactions can be deleted');
    }

    try {
      // Delete the transaction
      const result = await this.db.inventoryTransaction.delete({
        where: { id }
      });

      // Publish transaction cancelled event
      await this.transactionPublisher.publishTransactionCancelled(
        id,
        existingTransaction.transactionType as TransactionType,
        existingTransaction
      );

      return result;
    } catch (error) {
      console.error('Error deleting transaction', error);
      throw new BadRequestException('Failed to delete inventory transaction');
    }
  }

  async process(id: string, processDto: ProcessTransactionDto) {
    // Verify the transaction exists
    const existingTransaction = await this.findOne(id);
    
    // Can only process draft transactions
    if (existingTransaction.status !== TransactionStatus.DRAFT) {
      throw new ConflictException('Only draft transactions can be processed');
    }

    // Begin a transaction to ensure all operations succeed or fail together
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Use the "db" type wrapper instead of direct prisma property access
        const prisma = tx as any;
        
        const transaction = await prisma.inventoryTransaction.update({
          where: { id },
          data: {
            status: TransactionStatus.COMPLETED,
            completedAt: new Date(),
            completedBy: 'system', // To be replaced with authenticated user ID
          },
          include: {
            lines: true,
            sourceWarehouse: true,
            targetWarehouse: true
          }
        });

        // Process each line
        for (const lineUpdate of processDto.lines) {
          const line = transaction.lines.find(l => l.id === lineUpdate.id);
          if (!line) {
            throw new NotFoundException(`Transaction line with ID ${lineUpdate.id} not found`);
          }

          // Update the transaction line
          await prisma.transactionLine.update({
            where: { id: lineUpdate.id },
            data: {
              processedQuantity: lineUpdate.processedQuantity,
              status: TransactionLineStatus.COMPLETE,
              notes: lineUpdate.notes,
              lotNumber: lineUpdate.lotNumber,
              serialNumber: lineUpdate.serialNumber,
              expirationDate: (lineUpdate as ProcessTransactionLineWithExpirationDto).expirationDate 
                ? new Date((lineUpdate as ProcessTransactionLineWithExpirationDto).expirationDate!) 
                : undefined
            }
          });

          // Update inventory levels based on transaction type
          switch (transaction.transactionType) {
            case TransactionType.RECEIPT:
              await this._increaseInventory(
                prisma,
                transaction.targetWarehouseId,
                line.productId,
                line.variantId,
                line.targetLocationId,
                lineUpdate.processedQuantity,
                lineUpdate.lotNumber,
                lineUpdate.serialNumber,
                (lineUpdate as ProcessTransactionLineWithExpirationDto).expirationDate
                  ? new Date((lineUpdate as ProcessTransactionLineWithExpirationDto).expirationDate!)
                  : undefined,
                line.unitCost
              );
              break;
              
            case TransactionType.SHIPMENT:
              await this._decreaseInventory(
                prisma,
                transaction.sourceWarehouseId,
                line.productId,
                line.variantId,
                line.sourceLocationId,
                lineUpdate.processedQuantity,
                lineUpdate.lotNumber,
                lineUpdate.serialNumber
              );
              break;
              
            case TransactionType.TRANSFER:
              // Decrease from source and increase in target
              await this._decreaseInventory(
                prisma,
                transaction.sourceWarehouseId,
                line.productId,
                line.variantId,
                line.sourceLocationId,
                lineUpdate.processedQuantity,
                lineUpdate.lotNumber,
                lineUpdate.serialNumber
              );
              
              await this._increaseInventory(
                prisma,
                transaction.targetWarehouseId,
                line.productId,
                line.variantId,
                line.targetLocationId,
                lineUpdate.processedQuantity,
                lineUpdate.lotNumber,
                lineUpdate.serialNumber,
                (lineUpdate as ProcessTransactionLineWithExpirationDto).expirationDate
                  ? new Date((lineUpdate as ProcessTransactionLineWithExpirationDto).expirationDate!)
                  : undefined,
                line.unitCost
              );
              break;
              
            case TransactionType.ADJUSTMENT:
              if (lineUpdate.processedQuantity > 0) {
                await this._increaseInventory(
                  prisma,
                  transaction.targetWarehouseId,
                  line.productId,
                  line.variantId,
                  line.targetLocationId,
                  lineUpdate.processedQuantity,
                  lineUpdate.lotNumber,
                  lineUpdate.serialNumber,
                  (lineUpdate as ProcessTransactionLineWithExpirationDto).expirationDate
                    ? new Date((lineUpdate as ProcessTransactionLineWithExpirationDto).expirationDate!)
                    : undefined,
                  line.unitCost
                );
              } else {
                await this._decreaseInventory(
                  prisma,
                  transaction.targetWarehouseId,
                  line.productId,
                  line.variantId,
                  line.targetLocationId,
                  Math.abs(lineUpdate.processedQuantity),
                  lineUpdate.lotNumber,
                  lineUpdate.serialNumber
                );
              }
              break;
          }
        }

        return transaction;
      });

      // Publish transaction processed event
      await this.transactionPublisher.publishTransactionProcessed(
        result.id,
        result.transactionType as TransactionType,
        result.status as TransactionStatus,
        result
      );

      return result;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      console.error('Error processing transaction', error);
      throw new BadRequestException('Failed to process inventory transaction');
    }
  }

  private async _increaseInventory(
    prisma: any,
    warehouseId: string,
    productId: string,
    variantId: string | null,
    locationId: string | null,
    quantity: number,
    lotNumber?: string,
    serialNumber?: string,
    expirationDate?: Date,
    unitCost?: number
  ) {
    // Check if inventory record exists
    const inventoryKey = {
      warehouseId,
      productId,
      variantId: variantId || null,
      locationId: locationId || null,
      lotNumber: lotNumber || null,
      serialNumber: serialNumber || null
    };

    const existingInventory = await prisma.inventory.findFirst({
      where: inventoryKey
    });

    if (existingInventory) {
      // Update existing inventory
      await prisma.inventory.update({
        where: { id: existingInventory.id },
        data: {
          quantity: existingInventory.quantity + quantity,
          lastUpdated: new Date()
        }
      });
    } else {
      // Create new inventory record
      await prisma.inventory.create({
        data: {
          ...inventoryKey,
          quantity,
          unitCost,
          expirationDate,
          lastUpdated: new Date()
        }
      });
    }
  }

  private async _decreaseInventory(
    prisma: any,
    warehouseId: string,
    productId: string,
    variantId: string | null,
    locationId: string | null,
    quantity: number,
    lotNumber?: string,
    serialNumber?: string
  ) {
    // Check if inventory record exists
    const inventoryKey = {
      warehouseId,
      productId,
      variantId: variantId || null,
      locationId: locationId || null,
      lotNumber: lotNumber || null,
      serialNumber: serialNumber || null
    };

    const existingInventory = await prisma.inventory.findFirst({
      where: inventoryKey
    });

    if (!existingInventory) {
      throw new BadRequestException('Insufficient inventory: no existing inventory record found');
    }

    if (existingInventory.quantity < quantity) {
      throw new BadRequestException(`Insufficient inventory: have ${existingInventory.quantity}, need ${quantity}`);
    }

    // Update inventory
    await prisma.inventory.update({
      where: { id: existingInventory.id },
      data: {
        quantity: existingInventory.quantity - quantity,
        lastUpdated: new Date()
      }
    });
  }
}