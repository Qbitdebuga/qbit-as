"use client";

import React, { useState } from "react";
import { cn } from "./lib/utils";

interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export function Popover({
  children,
  content,
  align = "center",
  side = "bottom",
  className,
}: PopoverProps) {
  const [open, setOpen] = useState(false);

  const alignClass = {
    start: "origin-top-left left-0",
    center: "origin-top",
    end: "origin-top-right right-0",
  };

  const sideClass = {
    top: "bottom-full mb-2",
    right: "left-full ml-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
  };

  return (
    <div className="relative inline-block">
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer"
      >
        {children}
      </div>
      
      {open && (
        <div
          className={cn(
            "absolute z-50 w-64 rounded-md bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5",
            sideClass[side],
            alignClass[align],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export const PopoverTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("cursor-pointer", className)}
    {...props}
  />
));
PopoverTrigger.displayName = "PopoverTrigger";

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 w-64 rounded-md bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5",
      className
    )}
    {...props}
  />
));
PopoverContent.displayName = "PopoverContent"; 