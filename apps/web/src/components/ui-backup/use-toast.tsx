'use client';

import * as React from 'react';
import { Toast } from './toast';

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement;

export type ToastOptions = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive';
};

const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastOptions & {
  id: string;
  dismiss: () => void;
};

type ToasterState = {
  toasts: ToasterToast[];
};

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType['ADD_TOAST'];
      toast: ToasterToast;
    }
  | {
      type: ActionType['UPDATE_TOAST'];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType['DISMISS_TOAST'];
      toastId?: string;
    }
  | {
      type: ActionType['REMOVE_TOAST'];
      toastId?: string;
    };

interface ToastContextValue {
  toasts: ToasterToast[];
  addToast: (content: ToastOptions) => string;
  updateToast: (id: string, content: ToastOptions) => void;
  dismissToast: (id: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue>({
  toasts: [],
  addToast: () => '',
  updateToast: () => {},
  dismissToast: () => {},
  removeToast: () => {},
});

// A basic implementation - for a real app, you might want to use a library like React Query or SWR
export function useToast() {
  return React.useContext(ToastContext);
}

// A simplified toast implementation
export function toast(options: ToastOptions) {
  // In a real app, this would be a more complex implementation
  // This is just a stub for now
  console.log('Toast:', options.title, options.description, options.variant);
  return { id: genId(), dismiss: () => {} };
}
