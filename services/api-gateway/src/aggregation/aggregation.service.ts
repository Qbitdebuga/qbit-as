import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuthClientService } from '../clients/auth-client.service.js';
import { GeneralLedgerClientService } from '../clients/general-ledger-client.service.js';
import { AccountDetailsResponseDto, DashboardResponseDto } from './dto/index.js';

/**
 * Service for aggregating data from multiple microservices
 */
@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(
    private readonly authClient: AuthClientService,
    private readonly glClient: GeneralLedgerClientService
  ) {}

  /**
   * Get user financial overview, combining data from Auth and GL services
   */
  async getUserFinancialOverview(userId: string): Promise<DashboardResponseDto> {
    try {
      // Get a service token for Auth service
      const serviceToken = await this.authClient.getServiceToken(['users:read', 'gl:read']);
      
      // Fetch user data from Auth service
      const user = await this.authClient.getUserById(userId, serviceToken);
      
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Fetch financial data from General Ledger service
      const accounts = await this.glClient.getAccounts();
      
      // Get journal entries for recent transactions
      const journalEntriesResponse = await this.glClient.getJournalEntries(1, 5); // Most recent 5 entries
      const recentTransactions = journalEntriesResponse.data || [];
      
      // Get financial statements
      const balanceSheetData = await this.glClient.getFinancialStatement('balance-sheet', {
        asOfDate: new Date().toISOString().split('T')[0]
      });
      
      const incomeStatementData = await this.glClient.getFinancialStatement('income-statement', {
        fromDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0]
      });
      
      // Extract summary data from financial statements
      const balanceSheet = {
        totalAssets: this.extractTotalAssets(balanceSheetData),
        totalLiabilities: this.extractTotalLiabilities(balanceSheetData),
        equity: this.extractTotalEquity(balanceSheetData)
      };
      
      const incomeStatement = {
        revenue: this.extractTotalRevenue(incomeStatementData),
        expenses: this.extractTotalExpenses(incomeStatementData),
        netIncome: this.extractNetIncome(incomeStatementData)
      };
      
      // Combine data from multiple services
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles,
        },
        financialSummary: {
          totalAccounts: accounts.length,
          recentTransactions,
          balanceSheet,
          incomeStatement,
        }
      };
    } catch (error: any) {
      this.logger.error(`Error fetching dashboard data for user ${userId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve financial overview: ${error.message}`);
    }
  }
  
  /**
   * Get account details with transaction history
   */
  async getAccountWithTransactions(
    accountId: string, 
    fromDate?: string, 
    toDate?: string
  ): Promise<AccountDetailsResponseDto> {
    try {
      // Get account details
      const account = await this.glClient.getAccountById(accountId);
      
      if (!account) {
        throw new NotFoundException(`Account with ID ${accountId} not found`);
      }
      
      // Get journal entries for this account using filtering parameters
      // This is a simulation - in a real implementation we would call a specialized endpoint
      const journalEntriesResponse = await this.glClient.getJournalEntries(1, 100);
      const transactions = (journalEntriesResponse.data || [])
        .filter((entry: any) => {
          // Filter entries that include this account ID
          return entry.lines?.some((line: any) => line.accountId === accountId);
        })
        .map((entry: any) => {
          // Map journal entries to transactions format
          // Find the line for this account
          const line = entry.lines.find((l: any) => l.accountId === accountId);
          return {
            id: entry.id,
            date: entry.date,
            description: entry.description,
            reference: entry.reference || '',
            debit: line?.debit || 0,
            credit: line?.credit || 0,
            status: entry.status || 'posted'
          };
        });
      
      // Calculate current balance
      const balance = transactions.reduce((sum: number, transaction: any) => {
        return sum + (transaction.debit || 0) - (transaction.credit || 0);
      }, 0);
      
      return {
        account,
        transactions,
        balance
      };
    } catch (error: any) {
      this.logger.error(`Error fetching account details for account ${accountId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve account details: ${error.message}`);
    }
  }
  
  /**
   * Helper methods for extracting values from financial statements
   */
  private extractTotalAssets(balanceSheet: any): number {
    // In a real implementation, this would parse the balance sheet to find the total assets
    return balanceSheet?.totalAssets || 0;
  }
  
  private extractTotalLiabilities(balanceSheet: any): number {
    return balanceSheet?.totalLiabilities || 0;
  }
  
  private extractTotalEquity(balanceSheet: any): number {
    return balanceSheet?.totalEquity || 0;
  }
  
  private extractTotalRevenue(incomeStatement: any): number {
    return incomeStatement?.totalRevenue || 0;
  }
  
  private extractTotalExpenses(incomeStatement: any): number {
    return incomeStatement?.totalExpenses || 0;
  }
  
  private extractNetIncome(incomeStatement: any): number {
    return incomeStatement?.netIncome || 0;
  }
} 