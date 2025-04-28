import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepreciationMethod } from './enums/depreciation-method.enum';
import { CalculateDepreciationDto, CalculateDepreciationResponseDto } from './dto/calculate-depreciation.dto';
import { DepreciationScheduleEntity } from './entities/depreciation-schedule.entity';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DepreciationService {
  private readonly logger = new Logger(DepreciationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Helper property to access Prisma models with type casting
  private get db() {
    return this.prisma as any;
  }

  /**
   * Calculate depreciation for a specific asset
   */
  async calculateDepreciation(
    calculateDto: CalculateDepreciationDto,
  ): Promise<CalculateDepreciationResponseDto> {
    const { assetId, depreciationMethod, asOfDate, includeProjections, projectionPeriods } = calculateDto;

    // Get the asset with its latest depreciation entry
    const asset = await this?.db.asset.findUnique({
      where: { id: assetId },
      include: {
        depreciationEntries: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    // Determine which depreciation method to use
    const methodToUse = depreciationMethod || asset.depreciationMethod;
    
    // Get the calculation date (default to today)
    const calculationDate = asOfDate ? new Date(asOfDate) : new Date();

    // Get historical depreciation entries
    const historicalEntries = await this?.db.depreciationEntry.findMany({
      where: { assetId },
      orderBy: { date: 'asc' },
    });

    // Calculate current depreciation values
    const { currentBookValue, accumulatedDepreciation, entries } = this.calculateDepreciationValues(
      asset, 
      methodToUse, 
      calculationDate,
      historicalEntries
    );

    // Check if asset is fully depreciated
    const isFullyDepreciated = currentBookValue.equals(asset.residualValue) || 
      (calculationDate > this.calculateFullDepreciationDate(asset, methodToUse));

    // Prepare response
    const response: CalculateDepreciationResponseDto = {
      assetId,
      originalCost: this.decimalToNumber(asset.purchaseCost),
      residualValue: this.decimalToNumber(asset.residualValue),
      depreciableAmount: this.decimalToNumber(asset?.purchaseCost.sub(asset.residualValue)),
      accumulatedDepreciation: this.decimalToNumber(accumulatedDepreciation),
      currentBookValue: this.decimalToNumber(currentBookValue),
      isFullyDepreciated,
      depreciationMethod: methodToUse,
      entries: entries.map(entry => ({
        date: entry?.date.toISOString(),
        amount: this.decimalToNumber(entry.amount),
        bookValue: this.decimalToNumber(entry.bookValue)
      }))
    };

    // Calculate projected depreciation if requested
    if (includeProjections) {
      response.projectedEntries = await this.calculateProjectedDepreciation(
        asset,
        methodToUse,
        currentBookValue,
        calculationDate,
        projectionPeriods || 12
      );
    }

    return response;
  }

  /**
   * Generate a depreciation schedule for an asset
   */
  async generateDepreciationSchedule(assetId: string): Promise<DepreciationScheduleEntity> {
    const asset = await this?.db.asset.findUnique({
      where: { id: assetId },
      include: {
        depreciationEntries: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    // Calculate current depreciation
    const { currentBookValue, accumulatedDepreciation } = await this.getCurrentDepreciation(assetId);
    
    // Generate projected entries for the remaining life of the asset
    const currentDate = new Date();
    const remainingMonths = this.calculateRemainingLifeInMonths(asset, currentDate);
    
    const projectedEntries = await this.calculateProjectedDepreciation(
      asset,
      asset.depreciationMethod,
      currentBookValue,
      currentDate,
      remainingMonths
    );

    return {
      assetId: asset.id,
      originalCost: asset.purchaseCost,
      residualValue: asset.residualValue,
      depreciableAmount: asset?.purchaseCost.sub(asset.residualValue),
      accumulatedDepreciation,
      currentBookValue,
      isFullyDepreciated: currentBookValue.equals(asset.residualValue),
      entries: asset.depreciationEntries,
      projectedEntries: projectedEntries.map(entry => ({
        date: new Date(entry.date),
        amount: new Decimal(entry.amount),
        bookValue: new Decimal(entry.bookValue)
      }))
    };
  }

  /**
   * Record a depreciation entry for an asset
   */
  async recordDepreciation(assetId: string, date: Date, amount: number): Promise<void> {
    const asset = await this?.db.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    // Get the latest depreciation entry
    const latestEntry = await this?.db.depreciationEntry.findFirst({
      where: { assetId },
      orderBy: { date: 'desc' },
    });

    // Calculate current book value
    const currentBookValue = latestEntry
      ? latestEntry.bookValue
      : asset.purchaseCost;

    // Ensure we don't depreciate below residual value
    const depreciationAmount = new Decimal(amount);
    const newBookValue = currentBookValue.sub(depreciationAmount);
    
    if (newBookValue.lessThan(asset.residualValue)) {
      this?.logger.warn(`Depreciation amount ${amount} would reduce book value below residual value for asset ${assetId}`);
      // Adjust the amount to not go below residual value
      const adjustedAmount = currentBookValue.sub(asset.residualValue);
      
      await this?.db.depreciationEntry.create({
        data: {
          assetId,
          date,
          amount: adjustedAmount,
          bookValue: asset.residualValue,
        },
      });

      // Update asset status if fully depreciated
      await this?.db.asset.update({
        where: { id: assetId },
        data: { status: 'FULLY_DEPRECIATED' },
      });
    } else {
      // Record the depreciation entry
      await this?.db.depreciationEntry.create({
        data: {
          assetId,
          date,
          amount: depreciationAmount,
          bookValue: newBookValue,
        },
      });
    }
  }

  /**
   * Get the current depreciation status for an asset
   */
  async getCurrentDepreciation(assetId: string): Promise<{ currentBookValue: Decimal; accumulatedDepreciation: Decimal }> {
    const asset = await this?.db.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    // Get the latest depreciation entry
    const latestEntry = await this?.db.depreciationEntry.findFirst({
      where: { assetId },
      orderBy: { date: 'desc' },
    });

    if (latestEntry) {
      return {
        currentBookValue: latestEntry.bookValue,
        accumulatedDepreciation: asset?.purchaseCost.sub(latestEntry.bookValue),
      };
    }

    // If no entries exist, calculate based on purchase date and method
    const currentDate = new Date();
    const { accumulatedDepreciation, currentBookValue } = this.calculateCurrentDepreciation(
      asset,
      asset.depreciationMethod,
      currentDate
    );

    return { currentBookValue, accumulatedDepreciation };
  }

  /**
   * Calculate depreciation values based on method
   */
  private calculateDepreciationValues(
    asset: any,
    method: DepreciationMethod,
    asOfDate: Date,
    historicalEntries: any[]
  ): { currentBookValue: Decimal; accumulatedDepreciation: Decimal; entries: any[] } {
    // If there are historical entries, use the latest one as the starting point
    if (historicalEntries.length > 0) {
      const latestEntry = historicalEntries[historicalEntries.length - 1];
      return {
        currentBookValue: latestEntry.bookValue,
        accumulatedDepreciation: asset?.purchaseCost.sub(latestEntry.bookValue),
        entries: historicalEntries
      };
    }

    // Otherwise calculate from scratch
    const { accumulatedDepreciation, currentBookValue } = this.calculateCurrentDepreciation(
      asset, 
      method,
      asOfDate
    );

    // Create a synthetic entry for the current calculation
    const syntheticEntry = {
      date: asOfDate,
      amount: accumulatedDepreciation,
      bookValue: currentBookValue
    };

    return {
      currentBookValue,
      accumulatedDepreciation,
      entries: [syntheticEntry]
    };
  }

  /**
   * Calculate current depreciation for an asset using the specified method
   */
  private calculateCurrentDepreciation(
    asset: any,
    method: DepreciationMethod,
    currentDate: Date
  ): { accumulatedDepreciation: Decimal; currentBookValue: Decimal } {
    const purchaseDate = asset.purchaseDate;
    const purchaseCost = asset.purchaseCost;
    const residualValue = asset.residualValue;
    const assetLifeYears = asset.assetLifeYears;
    
    const depreciableAmount = purchaseCost.sub(residualValue);
    const lifetimeInMonths = assetLifeYears * 12;
    
    let accumulatedDepreciation = new Decimal(0);
    
    // Calculate months since purchase
    const monthsSincePurchase = this.calculateMonthsElapsed(purchaseDate, currentDate);
    
    switch (method) {
      case DepreciationMethod.STRAIGHT_LINE:
        // Simple straight-line calculation
        const monthlyDepreciation = depreciableAmount.div(lifetimeInMonths);
        const calculatedMonths = Math.min(monthsSincePurchase, lifetimeInMonths);
        accumulatedDepreciation = monthlyDepreciation.mul(calculatedMonths);
        break;
        
      case DepreciationMethod.DECLINING_BALANCE:
        // Declining balance calculation (rate = 1.5 / assetLifeYears)
        const rate = 1.5 / assetLifeYears;
        accumulatedDepreciation = this.calculateDecliningBalance(
          purchaseCost,
          residualValue,
          rate,
          monthsSincePurchase / 12
        );
        break;
        
      case DepreciationMethod.DOUBLE_DECLINING_BALANCE:
        // Double declining balance (rate = 2 / assetLifeYears)
        const doubleRate = 2.0 / assetLifeYears;
        accumulatedDepreciation = this.calculateDecliningBalance(
          purchaseCost,
          residualValue,
          doubleRate,
          monthsSincePurchase / 12
        );
        break;
        
      case DepreciationMethod.SUM_OF_YEARS_DIGITS:
        // Sum of years digits calculation
        accumulatedDepreciation = this.calculateSumOfYearsDigits(
          depreciableAmount,
          assetLifeYears,
          monthsSincePurchase / 12
        );
        break;
        
      case DepreciationMethod.UNITS_OF_PRODUCTION:
        // For units of production, we would need actual usage data
        // As a fallback, use straight-line method
        this?.logger.warn(`Units of production method requires usage data, using straight-line as fallback for asset ${asset.id}`);
        const fallbackMonthlyDepreciation = depreciableAmount.div(lifetimeInMonths);
        accumulatedDepreciation = fallbackMonthlyDepreciation.mul(Math.min(monthsSincePurchase, lifetimeInMonths));
        break;
        
      default:
        // Default to straight-line
        const defaultMonthlyDepreciation = depreciableAmount.div(lifetimeInMonths);
        accumulatedDepreciation = defaultMonthlyDepreciation.mul(Math.min(monthsSincePurchase, lifetimeInMonths));
    }
    
    // Ensure depreciation doesn't exceed depreciable amount
    if (accumulatedDepreciation.greaterThan(depreciableAmount)) {
      accumulatedDepreciation = depreciableAmount;
    }
    
    const currentBookValue = purchaseCost.sub(accumulatedDepreciation);
    
    return {
      accumulatedDepreciation,
      currentBookValue
    };
  }

  /**
   * Calculate projected depreciation for future periods
   */
  private async calculateProjectedDepreciation(
    asset: any,
    method: DepreciationMethod,
    currentBookValue: Decimal,
    startDate: Date,
    periods: number
  ): Promise<{ date: string | null; amount: number | null; bookValue: number }[]> {
    const projections = [];
    const depreciableAmount = asset?.purchaseCost.sub(asset.residualValue);
    const lifetimeInMonths = asset.assetLifeYears * 12;
    const purchaseDate = asset.purchaseDate;
    
    // Calculate months since purchase
    const monthsSincePurchase = this.calculateMonthsElapsed(purchaseDate, startDate);
    
    // If asset is already fully depreciated, return empty projections
    if (currentBookValue.equals(asset.residualValue) || monthsSincePurchase >= lifetimeInMonths) {
      return [];
    }
    
    // Determine remaining months and cap projection periods accordingly
    const remainingMonths = lifetimeInMonths - monthsSincePurchase;
    const projectionMonths = Math.min(periods, remainingMonths);
    
    let projectedBookValue = currentBookValue;
    
    for (let i = 1; i <= projectionMonths; i++) {
      const projectionDate = new Date(startDate);
      projectionDate.setMonth(projectionDate.getMonth() + i);
      
      let depreciationAmount;
      
      switch (method) {
        case DepreciationMethod.STRAIGHT_LINE:
          // Monthly straight-line amount
          depreciationAmount = depreciableAmount.div(lifetimeInMonths);
          break;
          
        case DepreciationMethod.DECLINING_BALANCE:
        case DepreciationMethod.DOUBLE_DECLINING_BALANCE:
          // Monthly declining balance amount
          const annualRate = method === DepreciationMethod.DECLINING_BALANCE 
            ? 1.5 / asset.assetLifeYears
            : 2.0 / asset.assetLifeYears;
          depreciationAmount = projectedBookValue.mul(annualRate).div(12);
          break;
          
        case DepreciationMethod.SUM_OF_YEARS_DIGITS:
          // Get annual depreciation based on remaining years
          const yearsElapsed = Math.floor(monthsSincePurchase / 12) + (i / 12);
          const nextYearElapsed = yearsElapsed + (1/12);
          
          const currentYearDepreciation = this.calculateSumOfYearsDigits(
            depreciableAmount,
            asset.assetLifeYears,
            yearsElapsed
          );
          
          const nextYearDepreciation = this.calculateSumOfYearsDigits(
            depreciableAmount,
            asset.assetLifeYears,
            nextYearElapsed
          );
          
          depreciationAmount = nextYearDepreciation.sub(currentYearDepreciation);
          break;
          
        case DepreciationMethod.UNITS_OF_PRODUCTION:
          // For simplicity, use straight-line for projection
          depreciationAmount = depreciableAmount.div(lifetimeInMonths);
          break;
          
        default:
          depreciationAmount = depreciableAmount.div(lifetimeInMonths);
      }
      
      // Ensure we don't depreciate below residual value
      if (projectedBookValue.sub(depreciationAmount).lessThan(asset.residualValue)) {
        depreciationAmount = projectedBookValue.sub(asset.residualValue);
        projectedBookValue = asset.residualValue;
      } else {
        projectedBookValue = projectedBookValue.sub(depreciationAmount);
      }
      
      projections.push({
        date: projectionDate.toISOString(),
        amount: this.decimalToNumber(depreciationAmount),
        bookValue: this.decimalToNumber(projectedBookValue)
      });
      
      // Stop if we've reached the residual value
      if (projectedBookValue.equals(asset.residualValue)) {
        break;
      }
    }
    
    return projections;
  }

  /**
   * Calculate depreciation using declining balance method
   */
  private calculateDecliningBalance(
    purchaseCost: Decimal,
    residualValue: Decimal,
    annualRate: number,
    yearsElapsed: number
  ): Decimal {
    // Declining balance formula: BookValue = Cost * (1 - rate)^years
    const yearsToUse = Math.min(yearsElapsed, Math.ceil(Math.log(residualValue.div(purchaseCost).toNumber()) / Math.log(1 - annualRate)));
    
    const remainingValue = purchaseCost.mul(Math.pow(1 - annualRate, yearsToUse));
    
    // Don't go below residual value
    if (remainingValue.lessThan(residualValue)) {
      return purchaseCost.sub(residualValue);
    }
    
    return purchaseCost.sub(remainingValue);
  }

  /**
   * Calculate depreciation using sum-of-years-digits method
   */
  private calculateSumOfYearsDigits(
    depreciableAmount: Decimal,
    assetLifeYears: number,
    yearsElapsed: number
  ): Decimal {
    // Calculate sum of years: n(n+1)/2
    const sumOfYears = (assetLifeYears * (assetLifeYears + 1)) / 2;
    
    // Handle fractional years
    const fullYears = Math.floor(yearsElapsed);
    const fraction = yearsElapsed - fullYears;
    
    let accumulatedDepreciation = new Decimal(0);
    
    // Calculate depreciation for full years
    for (let year = 1; year <= fullYears; year++) {
      const yearFactor = (assetLifeYears - year + 1) / sumOfYears;
      accumulatedDepreciation = accumulatedDepreciation.add(depreciableAmount.mul(yearFactor));
    }
    
    // Add partial year depreciation if needed
    if (fraction > 0 && fullYears < assetLifeYears) {
      const yearFactor = (assetLifeYears - fullYears - 1 + 1) / sumOfYears;
      accumulatedDepreciation = accumulatedDepreciation.add(depreciableAmount.mul(yearFactor).mul(fraction));
    }
    
    return accumulatedDepreciation;
  }

  /**
   * Calculate the date when an asset will be fully depreciated
   */
  private calculateFullDepreciationDate(asset: any, method: DepreciationMethod): Date {
    const { purchaseDate, assetLifeYears } = asset;
    const fullDepreciationDate = new Date(purchaseDate);
    
    switch (method) {
      case DepreciationMethod.STRAIGHT_LINE:
        // Simply add the asset life in years
        fullDepreciationDate.setFullYear(fullDepreciationDate.getFullYear() + assetLifeYears);
        break;
        
      case DepreciationMethod.DECLINING_BALANCE:
      case DepreciationMethod.DOUBLE_DECLINING_BALANCE:
        // These methods approach but never reach zero, so use a threshold
        // For simplicity, use 1.2x the straight-line period as an approximation
        fullDepreciationDate.setFullYear(fullDepreciationDate.getFullYear() + Math.ceil(assetLifeYears * 1.2));
        break;
        
      case DepreciationMethod.SUM_OF_YEARS_DIGITS:
        // This method fully depreciates exactly at the end of the asset life
        fullDepreciationDate.setFullYear(fullDepreciationDate.getFullYear() + assetLifeYears);
        break;
        
      case DepreciationMethod.UNITS_OF_PRODUCTION:
        // Cannot predict without usage data, use straight-line as fallback
        fullDepreciationDate.setFullYear(fullDepreciationDate.getFullYear() + assetLifeYears);
        break;
        
      default:
        fullDepreciationDate.setFullYear(fullDepreciationDate.getFullYear() + assetLifeYears);
    }
    
    return fullDepreciationDate;
  }

  /**
   * Calculate months elapsed between two dates
   */
  private calculateMonthsElapsed(startDate: Date, endDate: Date): number {
    return (
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) +
      (endDate.getDate() >= startDate.getDate() ? 0 : -1)
    );
  }

  /**
   * Calculate remaining life of an asset in months
   */
  private calculateRemainingLifeInMonths(asset: any, currentDate: Date): number {
    const { purchaseDate, assetLifeYears } = asset;
    const totalMonths = assetLifeYears * 12;
    const elapsedMonths = this.calculateMonthsElapsed(purchaseDate, currentDate);
    
    return Math.max(0, totalMonths - elapsedMonths);
  }

  /**
   * Convert Decimal to JavaScript number
   */
  private decimalToNumber(decimal: Decimal): number {
    return parseFloat(decimal.toString());
  }
} 