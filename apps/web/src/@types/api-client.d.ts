declare module '@qbit/api-client' {
  export enum AccountType {
    ASSET = 'ASSET',
    LIABILITY = 'LIABILITY',
    EQUITY = 'EQUITY',
    REVENUE = 'REVENUE',
    EXPENSE = 'EXPENSE'
  }

  export interface Account {
    id: string;
    code: string;
    name: string;
    type: AccountType;
    subtype: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
} 