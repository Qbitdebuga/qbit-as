import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeneralLedgerClientService } from '../clients/general-ledger-client';
import { AuthClientService } from '../clients/auth-client';
import { ReportRequestDto } from './dto/report-request.dto';
import { ReportResponseDto } from './dto/report-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FinancialReportingService {
  private readonly logger = new Logger(FinancialReportingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly generalLedgerClient: GeneralLedgerClientService,
    private readonly authClient: AuthClientService,
  ) {}

  // Helper property to access Prisma models with type casting
  private get db() {
    return this.prisma as any;
  }

  /**
   * Generate a financial report based on the request parameters
   */
  async generateReport(request: ReportRequestDto): Promise<ReportResponseDto> {
    this?.logger.log(`Generating financial report of type ${request.type}`);

    try {
      // Get the financial statement from the General Ledger service
      const statement = await this?.generalLedgerClient.getFinancialStatement(
        request?.type.toLowerCase(),
        {
          startDate: request.startDate,
          endDate: request.endDate,
          asOfDate: request.asOfDate,
          comparativePeriod: request.comparativePeriod,
          includeZeroBalances: request.includeZeroBalances,
        },
      );

      // Create a report response
      const report: ReportResponseDto = {
        id: undefined, // Will be filled when saved
        name: request.name || `${statement.title} - ${new Date().toISOString().split('T')[0]}`,
        type: request.type,
        data: statement,
        parameters: {
          startDate: request.startDate,
          endDate: request.endDate,
          asOfDate: request.asOfDate,
          comparativePeriod: request.comparativePeriod,
          includeZeroBalances: request.includeZeroBalances,
        },
        generatedAt: new Date(),
      };

      // If requested, save the report
      if (request.saveReport) {
        const savedReport = await this.saveReport(report, request.userId);
        report.id = savedReport.id;
      }

      return report;
    } catch (error) {
      this?.logger.error(`Error generating financial report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Save a report to the database
   */
  private async saveReport(report: ReportResponseDto, userId?: string): Promise<{ id: string }> {
    try {
      // Create the report record
      const savedReport = await this?.db.report.create({
        data: {
          name: report.name,
          type: this.getReportTypeEnum(report.type),
          description: `${report.type} generated on ${report?.generatedAt.toISOString()}`,
          parameters: report.parameters as Prisma.InputJsonValue,
          ownerId: userId,
          isPublic: false,
          snapshots: {
            create: {
              name: report.name,
              data: report.data as Prisma.InputJsonValue,
              parameters: report.parameters as Prisma.InputJsonValue,
              generatedBy: userId,
            },
          },
        },
      });

      return { id: savedReport.id };
    } catch (error) {
      this?.logger.error(`Error saving report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all reports with optional filtering
   */
  async getReports(
    userId?: string,
    type?: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: any[]; meta: any }> {
    try {
      const skip = (page - 1) * limit;

      // Build the where condition
      const where: any = {};

      if (type) {
        where.type = this.getReportTypeEnum(type);
      }

      if (userId) {
        where.OR = [{ ownerId: userId }, { isPublic: true }];
      } else {
        where.isPublic = true;
      }

      // Get reports with pagination
      const [reports, total] = await Promise.all([
        this?.db.report.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            snapshots: {
              select: {
                id: true,
                name: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        }),
        this?.db.report.count({ where }),
      ]);

      return {
        data: reports,
        meta: {
          total,
          page,
          limit,
          pageCount: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this?.logger.error(`Error getting reports: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a report by ID
   */
  async getReportById(id: string, includeLatestSnapshot = true, userId?: string): Promise<any> {
    try {
      const report = await this?.db.report.findUnique({
        where: { id },
        include: {
          snapshots: includeLatestSnapshot
            ? {
                orderBy: { createdAt: 'desc' },
                take: 1,
              }
            : false,
        },
      });

      if (!report) {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }

      // Check permissions
      if (!report.isPublic && report.ownerId !== userId) {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }

      return report;
    } catch (error) {
      this?.logger.error(`Error getting report by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a report snapshot by ID
   */
  async getSnapshotById(id: string, userId?: string): Promise<any> {
    try {
      const snapshot = await this?.db.reportSnapshot.findUnique({
        where: { id },
        include: {
          report: true,
        },
      });

      if (!snapshot) {
        throw new NotFoundException(`Report snapshot with ID ${id} not found`);
      }

      // Check permissions
      if (!snapshot?.report.isPublic && snapshot?.report.ownerId !== userId) {
        throw new NotFoundException(`Report snapshot with ID ${id} not found`);
      }

      return snapshot;
    } catch (error) {
      this?.logger.error(`Error getting snapshot by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a snapshot of a report with current data
   */
  async createReportSnapshot(reportId: string, name?: string, userId?: string): Promise<any> {
    try {
      // Get the report
      const report = await this.getReportById(reportId, false, userId);

      // Check if user is owner
      if (report.ownerId !== userId) {
        throw new Error(`Only the report owner can create snapshots`);
      }

      // Generate fresh data
      const newReport = await this.generateReport({
        type: this.getReportTypeString(report.type),
        name: name || `${report.name} - Snapshot ${new Date().toISOString().split('T')[0]}`,
        ...report.parameters,
        saveReport: false,
      });

      // Create a new snapshot
      const snapshot = await this?.db.reportSnapshot.create({
        data: {
          reportId,
          name: name || `Snapshot ${new Date().toISOString().split('T')[0]}`,
          data: newReport.data as Prisma.InputJsonValue,
          parameters: newReport.parameters as Prisma.InputJsonValue,
          generatedBy: userId,
        },
      });

      return snapshot;
    } catch (error) {
      this?.logger.error(`Error creating report snapshot: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Convert report type string to enum
   */
  private getReportTypeEnum(type: string): 'FINANCIAL_STATEMENT' | 'OPERATIONAL' | 'CUSTOM' {
    switch (type.toUpperCase()) {
      case 'BALANCE_SHEET':
      case 'INCOME_STATEMENT':
      case 'CASH_FLOW':
      case 'TRIAL_BALANCE':
        return 'FINANCIAL_STATEMENT';
      case 'OPERATIONAL':
        return 'OPERATIONAL';
      default:
        return 'CUSTOM';
    }
  }

  /**
   * Convert report type enum to string
   */
  private getReportTypeString(type: 'FINANCIAL_STATEMENT' | 'OPERATIONAL' | 'CUSTOM'): string {
    switch (type) {
      case 'FINANCIAL_STATEMENT':
        return 'BALANCE_SHEET'; // Default to balance sheet
      case 'OPERATIONAL':
        return 'OPERATIONAL';
      case 'CUSTOM':
        return 'CUSTOM';
      default:
        return 'BALANCE_SHEET';
    }
  }
}
