import React from 'react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

interface PageHeaderHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {}

interface PageHeaderDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}

export function PageHeaderHeading({ className, children, ...props }: PageHeaderHeadingProps) {
  return (
    <h1 className={cn('text-2xl font-bold tracking-tight', className)} {...props}>
      {children}
    </h1>
  );
}

export function PageHeaderDescription({
  className,
  children,
  ...props
}: PageHeaderDescriptionProps) {
  return (
    <p className={cn('text-muted-foreground mt-1', className)} {...props}>
      {children}
    </p>
  );
}
