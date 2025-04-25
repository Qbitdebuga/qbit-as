"use client"

import * as React from "react"
import { cn } from "./lib/utils"

type AlertDialogProps = React.HTMLAttributes<HTMLDivElement> & {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AlertDialog({ children, className, ...props }: AlertDialogProps) {
  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center", className)} {...props}>
      {children}
    </div>
  )
}

export function AlertDialogTrigger({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props}>{children}</button>
}

export function AlertDialogContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4", className)} {...props}>
      {children}
    </div>
  )
}

export function AlertDialogHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props}>{children}</div>
}

export function AlertDialogTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props}>{children}</h2>
}

export function AlertDialogDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-gray-500", className)} {...props}>{children}</p>
}

export function AlertDialogFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex justify-end gap-3 mt-6", className)} {...props}>{children}</div>
}

export function AlertDialogAction({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn("px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700", className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function AlertDialogCancel({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn("px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50", className)}
      {...props}
    >
      {children || "Cancel"}
    </button>
  )
} 