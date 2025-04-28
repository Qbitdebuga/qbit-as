import React, { HTMLAttributes } from "react";
import { cn } from "./lib/utils";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  // You can add specific props here if needed
}

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div 
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} 
      {...props}
    >
      {children}
    </div>
  );
} 