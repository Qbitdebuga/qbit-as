import React from "react";
import { cn } from "./lib/utils";
import { LoadingSpinner } from "./loading-spinner";

export interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
  className?: string;
  textClassName?: string;
  containerClassName?: string;
}

export function LoadingIndicator({ 
  size = "md", 
  text = "Loading...", 
  fullScreen = false,
  className,
  textClassName,
  containerClassName,
}: LoadingIndicatorProps) {
  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-2",
      containerClassName
    )}>
      <LoadingSpinner size={size} className={className} />
      {text && (
        <p className={cn(
          "text-muted-foreground animate-pulse text-sm font-medium",
          size === "lg" && "text-base",
          textClassName
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
} 