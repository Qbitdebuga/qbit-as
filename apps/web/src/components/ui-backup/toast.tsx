"use client"

import * as React from "react"
import { cn } from "./lib/utils"

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
          variant === "default" && "bg-white text-gray-950",
          variant === "destructive" && "border-red-400 bg-red-50 text-red-800",
          className
        )}
        {...props}
      />
    )
  }
)
Toast.displayName = "Toast" 