import React from 'react';
import { cn } from './lib/utils';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  title: string;
  description?: string;
}

export function Heading({ title, description, className, ...props }: HeadingProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
}
