import { ReactNode } from 'react';

// General UI interfaces
export interface WithChildren {
  children: ReactNode;
}

export interface WithClassName {
  className?: string;
}

export interface BaseProps extends WithClassName {
  id?: string;
}

export interface WithChildrenProps extends BaseProps, WithChildren {}

// ShadCN UI specific types
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

// Table related interfaces
export interface ColumnDef<T> {
  id?: string;
  accessorKey?: string;
  header: string | ReactNode;
  cell?: (props: { row: { original: T } }) => ReactNode;
  enableSorting?: boolean;
  enableFilter?: boolean;
}

export interface SortingState {
  id: string;
  desc: boolean;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: PaginationState;
  setPagination?: (pagination: PaginationState) => void;
  sorting?: SortingState[];
  setSorting?: (sorting: SortingState[]) => void;
  totalCount?: number;
  loading?: boolean;
  noResultsMessage?: string;
}

// Form related interfaces
export interface FormFieldProps extends BaseProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface MultiSelectOption extends SelectOption {
  disabled?: boolean;
  description?: string;
}

// Modal/Dialog interfaces
export interface ModalProps extends WithChildrenProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Toast interfaces
export type ToastVariant = 'default' | 'destructive';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastActionElement {
  altText: string;
  onClick: () => void;
  children: ReactNode;
}

// Card interfaces
export interface CardProps extends WithChildrenProps {
  title?: string;
  description?: string;
  footer?: ReactNode;
  isHoverable?: boolean;
}

// Date picker interfaces
export interface DatePickerProps extends FormFieldProps {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
  format?: string;
} 