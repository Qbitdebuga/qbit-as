"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
        "text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed",
        "disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

type SelectGroupProps = React.HTMLAttributes<HTMLOptGroupElement>;

function SelectGroup({ className, ...props }: SelectGroupProps) {
  return (
    <optgroup
      className={cn("", className)}
      {...props}
    />
  );
}

type SelectOptionProps = React.OptionHTMLAttributes<HTMLOptionElement>;

function SelectOption({ className, ...props }: SelectOptionProps) {
  return (
    <option
      className={cn("", className)}
      {...props}
    />
  );
}

type SelectLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <label
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}

type SelectTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <button
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input",
        "bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none",
        "focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed",
        "disabled:opacity-50 aria-expanded:ring-2 aria-expanded:ring-ring aria-expanded:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
      <span className="pointer-events-none ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </span>
    </button>
  );
}

type SelectContentProps = React.HTMLAttributes<HTMLDivElement>;
type SelectItemProps = React.HTMLAttributes<HTMLDivElement>;
type SelectValueProps = React.HTMLAttributes<HTMLSpanElement>;

function SelectContent({ className, children, ...props }: SelectContentProps) {
  return (
    <div 
      className={cn(
        "relative z-50 max-h-80 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function SelectValue({ className, children, ...props }: SelectValueProps) {
  return (
    <span className={className} {...props}>
      {children}
    </span>
  );
}

export { Select, SelectGroup, SelectOption, SelectLabel, SelectTrigger, SelectValue, SelectContent, SelectItem }; 