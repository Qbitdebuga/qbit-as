"use client";

import React from "react";
import { cn } from "./lib/utils";
import { Input } from "./input";

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className={cn("relative", className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <Input
          type="date"
          className={cn("w-full")}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export { DatePicker }; 