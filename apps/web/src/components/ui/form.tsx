"use client";

import React from "react";
import { cn } from "./lib/utils";

// Form Root
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn("space-y-6", className)}
        {...props}
      />
    );
  }
);
Form.displayName = "Form";

// Form Field
interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      />
    );
  }
);
FormField.displayName = "FormField";

// Form Label
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn("block text-sm font-medium text-gray-700", className)}
        {...props}
      />
    );
  }
);
FormLabel.displayName = "FormLabel";

// Form Error
interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormError = React.forwardRef<HTMLParagraphElement, FormErrorProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-red-600 mt-1", className)}
        {...props}
      />
    );
  }
);
FormError.displayName = "FormError";

export { Form, FormField, FormLabel, FormError }; 