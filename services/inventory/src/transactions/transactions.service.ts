import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTransactionDto, TransactionStatus, TransactionType } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ProcessTransactionDto } from './dto/process-transaction.dto';
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

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    try {
      // Validate warehouse IDs
      if (createTransactionDto.targetWarehouseId) {
        const targetWarehouse = await this.prisma.warehouse.findUnique({
          where: { id: createTransactionDto.targetWarehouseId }
        });
        if (!targetWarehouse) {
          throw new NotFoundException(`Target warehouse with ID ${createTransactionDto.targetWarehouseId} not found`);
        }
      }

      if (createTransactionDto.sourceWarehouseId) {
        const sourceWarehouse = await this.prisma.warehouse.findUnique({
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
            const sourceLocation = await this.prisma.warehouseLocation.findUnique({
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
            const targetLocation = await this.prisma.warehouseLocation.findUnique({
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
      const createdTransaction = await this.prisma.inventoryTransaction.create({
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
          status: createTransactionDto.status || TransactionStatus.DRAFT,
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
      
      const where: Prisma.InventoryTransactionWhereInput = {};
      
      // Apply filters
      if (searchTerm) {
        where.OR = [
          { referenceNumber: { contains: searchTerm, mode: 'insensitive' } },
          { notes: { contains: searchTerm, mode: 'insensitive' } },
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
      
      if (fromDate) {
        where.transactionDate = {
          ...where.transactionDate,
          gte: fromDate
        };
      }
      
      if (toDate) {
        where.transactionDate = {
          ...where.transactionDate,
          lte: toDate
        };
      }
      
      // Apply ordering
      let orderByClause: Prisma.InventoryTransactionOrderByWithRelationInput = { 
        transactionDate: 'desc' 
      };
      
      if (orderBy) {
        const [field, direction] = orderBy.split(':');
        orderByClause = {
          [field]: direction === 'desc' ? 'desc' : 'asc',
        };
      }

      // Execute query
      const [transactions, total] = await Promise.all([
        this.prisma.inventoryTransaction.findMany({
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
        this.prisma.inventoryTransaction.count({ where })
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
    const transaction = await this.prisma.inventoryTransaction.findUnique({
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
      const transactionData: Prisma.InventoryTransactionUpdateInput = {
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
          const sourceWarehouse = await this.prisma.warehouse.findUnique({
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
          const targetWarehouse = await this.prisma.warehouse.findUnique({
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

      // Handle line items
      if (updateTransactionDto.lines && updateTransactionDto.lines.length > 0) {
        const linesToUpdate = updateTransactionDto.lines.filter(line => line.id);
        const linesToCreate = updateTransactionDto.lines.filter(line => !line.id);
        
        // Update existing lines
        for (const line of linesToUpdate) {
          await this.prisma.transactionLine.update({
            where: { id: line.id },
            data: {
              productId: line.productId,
              variantId: line.variantId,
              sourceLocationId: line.sourceLocationId,
              targetLocationId: line.targetLocationId,
              expectedQuantity: line.expectedQuantity,
              notes: line.notes,
              lotNumber: line.lotNumber,
              serialNumber: line.serialNumber,
              expirationDate: line.expirationDate ? new Date(line.expirationDate) : undefined,
              unitCost: line.unitCost
            }
          });
        }
        
        // Create new lines
        if (linesToCreate.length > 0) {
          await this.prisma.transactionLine.createMany({
            data: linesToCreate.map(line => ({
              transactionId: id,
              productId: line.productId,
              variantId: line.variantId,
              sourceLocationId: line.sourceLocationId,
              targetLocationId: line.targetLocationId,
              expectedQuantity: line.expectedQuantity || 0,
              processedQuantity: line.processedQuantity || 0,
              status: line.status || TransactionLineStatus.PENDING,
              notes: line.notes,
              lotNumber: line.lotNumber,
              serialNumber: line.serialNumber,
              expirationDate: line.expirationDate ? new Date(line.expirationDate) : null,
              unitCost: line.unitCost
            }))
          });
        }
      }

      // Update the transaction
      return await this.prisma.inventoryTransaction.update({
        where: { id },
        data: transactionData,
        include: {
          lines: true,
          sourceWarehouse: true,
          targetWarehouse: true
        }
      });
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
      return await this.prisma.inventoryTransaction.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting transaction', error);
      throw new BadRequestException('Failed to delete inventory transaction');
    }
  }

  async process(id: string, processTransactionDto: ProcessTransactionDto) {
    // Verify the transaction exists
    const existingTransaction = await this.findOne(id);
    
    // Verify the current status allows processing
    if (existingTransaction.status === TransactionStatus.CANCELLED) {
      throw new ConflictException('Cancelled transactions cannot be processed');
    }
    
    if (existingTransaction.status === TransactionStatus.COMPLETED) {
      throw new ConflictException('Completed transactions cannot be processed again');
    }

    try {
      await this.prisma.$transaction(async (prisma) => {
        // Update line items
        for (const line of processTransactionDto.lines) {
          // Find the existing line
          const existingLine = existingTransaction.lines.find(l => l.id === line.id);
          if (!existingLine) {
            throw new NotFoundException(`Transaction line with ID ${line.id} not found`);
          }
          
          // Update the line
          await prisma.transactionLine.update({
            where: { id: line.id },
            data: {
              processedQuantity: line.processedQuantity,
              status: line.status || this.determineLineStatus(
                existingLine.expectedQuantity.toString(), 
                line.processedQuantity
              ),
              notes: line.notes !== undefined ? line.notes : existingLine.notes,
              lotNumber: line.lotNumber !== undefined ? line.lotNumber : existingLine.lotNumber,
              serialNumber: line.serialNumber !== undefined ? line.serialNumber : existingLine.serialNumber
            }
          });
          
          // Update inventory levels based on transaction type
          await this.updateInventoryLevels(
            prisma,
            existingTransaction.transactionType as TransactionType,
            existingLine,
            line.processedQuantity
          );
        }
        
        // Update the transaction status
        const transactionUpdate: any = {
          status: processTransactionDto.status
        };
        
        if (processTransactionDto.notes) {
          transactionUpdate.notes = processTransactionDto.notes;
        }
        
        if (processTransactionDto.status === TransactionStatus.COMPLETED) {
          transactionUpdate.completedAt = new Date();
          transactionUpdate.completedBy = 'system'; // To be replaced with authenticated user
        } else if (processTransactionDto.status === TransactionStatus.CANCELLED) {
          transactionUpdate.cancelledAt = new Date();
          transactionUpdate.cancelledBy = 'system'; // To be replaced with authenticated user
        }
        
        await prisma.inventoryTransaction.update({
          where: { id },
          data: transactionUpdate
        });
      });
      
      return this.findOne(id);
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

  private determineLineStatus(expectedQuantity: string, processedQuantity: number): TransactionLineStatus {
    const expected = parseFloat(expectedQuantity);
    
    if (processedQuantity === 0) {
      return TransactionLineStatus.PENDING;
    } else if (processedQuantity < expected) {
      return TransactionLineStatus.PARTIAL;
    } else {
      return TransactionLineStatus.COMPLETE;
    }
  }

  private async updateInventoryLevels(
    prisma: any,
    transactionType: TransactionType,
    existingLine: any,
    processedQuantity: number
  ) {
    const quantityChange = processedQuantity - parseFloat(existingLine.processedQuantity.toString());
    if (quantityChange === 0) return;
    
    const productId = existingLine.productId;
    const variantId = existingLine.variantId;
    
    switch (transactionType) {
      case TransactionType.RECEIPT:
        await this.incrementInventoryLevel(
          prisma,
          productId,
          variantId,
          existingLine.targetWarehouseId,
          existingLine.targetLocationId,
          quantityChange
        );
        break;
      
      case TransactionType.SHIPMENT:
        await this.decrementInventoryLevel(
          prisma,
          productId,
          variantId,
          existingLine.sourceWarehouseId,
          existingLine.sourceLocationId,
          quantityChange
        );
        break;
        
      case TransactionType.TRANSFER:
        if (quantityChange > 0) {
          await this.decrementInventoryLevel(
            prisma,
            productId,
            variantId,
            existingLine.sourceWarehouseId,
            existingLine.sourceLocationId,
            quantityChange
          );
          
          await this.incrementInventoryLevel(
            prisma,
            productId,
            variantId,
            existingLine.targetWarehouseId,
            existingLine.targetLocationId,
            quantityChange
          );
        }
        break;
        
      case TransactionType.ADJUSTMENT:
        // For adjustments, the quantity could be positive or negative
        await this.adjustInventoryLevel(
          prisma,
          productId,
          variantId,
          existingLine.targetWarehouseId,
          existingLine.targetLocationId,
          quantityChange
        );
        break;
        
      case TransactionType.COUNT:
        // For counts, we set the absolute quantity
        await this.setInventoryLevel(
          prisma,
          productId,
          variantId,
          existingLine.targetWarehouseId,
          existingLine.targetLocationId,
          processedQuantity
        );
        break;
    }
  }

  private async incrementInventoryLevel(
    prisma: any,
    productId: number | null,
    variantId: number | null,
    warehouseId: string,
    locationId: number | null,
    quantity: number
  ) {
    const inventoryLevel = await this.findOrCreateInventoryLevel(
      prisma,
      productId,
      variantId,
      warehouseId,
      locationId
    );
    
    if (inventoryLevel) {
      await prisma.inventoryLevel.update({
        where: { id: inventoryLevel.id },
        data: {
          quantity: {
            increment: quantity
          }
        }
      });
      
      // Also update the product or variant's total quantity
      if (productId) {
        await prisma.product.update({
          where: { id: productId },
          data: {
            quantityOnHand: {
              increment: quantity
            }
          }
        });
      } else if (variantId) {
        await prisma.productVariant.update({
          where: { id: variantId },
          data: {
            quantityOnHand: {
              increment: quantity
            }
          }
        });
      }
    }
  }

  private async decrementInventoryLevel(
    prisma: any,
    productId: number | null,
    variantId: number | null,
    warehouseId: string,
    locationId: number | null,
    quantity: number
  ) {
    const inventoryLevel = await this.findOrCreateInventoryLevel(
      prisma,
      productId,
      variantId,
      warehouseId,
      locationId
    );
    
    if (inventoryLevel) {
      await prisma.inventoryLevel.update({
        where: { id: inventoryLevel.id },
        data: {
          quantity: {
            decrement: quantity
          }
        }
      });
      
      // Also update the product or variant's total quantity
      if (productId) {
        await prisma.product.update({
          where: { id: productId },
          data: {
            quantityOnHand: {
              decrement: quantity
            }
          }
        });
      } else if (variantId) {
        await prisma.productVariant.update({
          where: { id: variantId },
          data: {
            quantityOnHand: {
              decrement: quantity
            }
          }
        });
      }
    }
  }

  private async adjustInventoryLevel(
    prisma: any,
    productId: number | null,
    variantId: number | null,
    warehouseId: string,
    locationId: number | null,
    quantity: number
  ) {
    const inventoryLevel = await this.findOrCreateInventoryLevel(
      prisma,
      productId,
      variantId,
      warehouseId,
      locationId
    );
    
    if (inventoryLevel) {
      if (quantity > 0) {
        await this.incrementInventoryLevel(
          prisma,
          productId,
          variantId,
          warehouseId,
          locationId,
          quantity
        );
      } else if (quantity < 0) {
        await this.decrementInventoryLevel(
          prisma,
          productId,
          variantId,
          warehouseId,
          locationId,
          Math.abs(quantity)
        );
      }
    }
  }

  private async setInventoryLevel(
    prisma: any,
    productId: number | null,
    variantId: number | null,
    warehouseId: string,
    locationId: number | null,
    quantity: number
  ) {
    const inventoryLevel = await this.findOrCreateInventoryLevel(
      prisma,
      productId,
      variantId,
      warehouseId,
      locationId
    );
    
    if (inventoryLevel) {
      // Get the current quantity
      const currentQuantity = parseFloat(inventoryLevel.quantity.toString());
      
      // Calculate the adjustment
      const adjustment = quantity - currentQuantity;
      
      if (adjustment !== 0) {
        await this.adjustInventoryLevel(
          prisma,
          productId,
          variantId,
          warehouseId,
          locationId,
          adjustment
        );
      }
    }
  }

  private async findOrCreateInventoryLevel(
    prisma: any,
    productId: number | null,
    variantId: number | null,
    warehouseId: string,
    locationId: number | null
  ) {
    // Find the existing inventory level
    const existingLevel = await prisma.inventoryLevel.findFirst({
      where: {
        productId,
        variantId,
        warehouseId,
        locationId
      }
    });
    
    if (existingLevel) {
      return existingLevel;
    }
    
    // Create a new inventory level if it doesn't exist
    return await prisma.inventoryLevel.create({
      data: {
        productId,
        variantId,
        warehouseId,
        locationId,
        quantity: 0
      }
    });
  }
} 