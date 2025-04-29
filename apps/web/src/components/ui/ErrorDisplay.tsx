import React from "react";
import { cn } from "./lib/utils";
import { AlertCircle, Info, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";

export type ErrorSeverity = "error" | "warning" | "info";

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  className?: string;
  retry?: () => void;
  dismiss?: () => void;
  details?: string;
  showDetails?: boolean;
}

export function ErrorDisplay({
  title,
  message,
  severity = "error",
  className,
  retry,
  dismiss,
  details,
  showDetails = false,
}: ErrorDisplayProps) {
  const [isExpanded, setIsExpanded] = React.useState(showDetails);

  // Default titles based on severity
  const defaultTitles = {
    error: "Error",
    warning: "Warning",
    info: "Information",
  };

  // Get icon based on severity
  const Icon = {
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }[severity];

  // Get variant based on severity
  const variant = {
    error: "destructive",
    warning: "warning",
    info: "default",
  }[severity] as "destructive" | "default";

  return (
    <Alert variant={variant} className={cn("my-4", className)}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title || defaultTitles[severity]}</AlertTitle>
      <AlertDescription>
        <div className="space-y-4">
          <p>{message}</p>
          
          {details && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs"
              >
                {isExpanded ? "Hide" : "Show"} Details
              </Button>
              
              {isExpanded && (
                <pre className="mt-2 max-h-[200px] overflow-auto rounded bg-muted p-2 text-xs">
                  {details}
                </pre>
              )}
            </div>
          )}
          
          {(retry || dismiss) && (
            <div className="flex gap-2 pt-2">
              {retry && (
                <Button size="sm" onClick={retry}>
                  Retry
                </Button>
              )}
              
              {dismiss && (
                <Button size="sm" variant="outline" onClick={dismiss}>
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
} 