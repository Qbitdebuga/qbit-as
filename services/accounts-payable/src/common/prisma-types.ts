import { Decimal } from '@prisma/client/runtime/library';

// Helper functions for data conversion
export const convertToDecimal = (value: number | string | undefined): Decimal | undefined => {
  if (value === undefined) return undefined;
  return new Decimal(String(value));
};

export const convertToNumber = (value: Decimal | number | string | undefined): number | undefined => {
  if (value === undefined) return undefined;
  return typeof value === 'object' ? parseFloat(value.toString()) : parseFloat(String(value));
};

export const convertToString = (value: any): string | undefined => {
  if (value === undefined) return undefined;
  return String(value);
};

export const convertToInt = (value: any): number | undefined => {
  if (value === undefined) return undefined;
  return parseInt(String(value), 10);
}; 