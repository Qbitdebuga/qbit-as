'use client';

import React from 'react';
import { cn } from './lib/utils';

type CalendarProps = React.HTMLAttributes<HTMLDivElement> & {
  mode?: 'single' | 'range' | 'multiple';
  selected?: Date | Date[] | { from: Date; to: Date };
  onSelect?: (day: Date) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
};

export function Calendar({
  className,
  mode = 'single',
  selected,
  onSelect,
  month = new Date(),
  onMonthChange,
  ...props
}: CalendarProps) {
  // This is a simplified implementation that renders a basic date picker UI
  // In a real app, you would use a proper date picker library

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();

  // Create arrays without using spread on iterator
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, () => null);
  const calendarDays = [...emptyDays, ...days];

  return (
    <div className={cn('w-full max-w-sm border rounded-md p-3', className)} {...props}>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => {
            const prevMonth = new Date(month);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            onMonthChange?.(prevMonth);
          }}
          className="p-2"
        >
          &lt;
        </button>
        <div className="font-medium">
          {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </div>
        <button
          onClick={() => {
            const nextMonth = new Date(month);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            onMonthChange?.(nextMonth);
          }}
          className="p-2"
        >
          &gt;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-sm font-medium p-2">
            {day}
          </div>
        ))}

        {calendarDays.map((day, i) => {
          const date = day ? new Date(month.getFullYear(), month.getMonth(), day) : null;
          const isSelected =
            date &&
            mode === 'single' &&
            selected instanceof Date &&
            date.getDate() === selected.getDate() &&
            date.getMonth() === selected.getMonth() &&
            date.getFullYear() === selected.getFullYear();

          return (
            <div
              key={i}
              className={cn(
                'p-2 text-center rounded-md',
                !day && 'invisible',
                isSelected && 'bg-blue-600 text-white',
                !isSelected && day && 'hover:bg-gray-100 cursor-pointer',
              )}
              onClick={() => {
                if (day && onSelect) {
                  onSelect(new Date(month.getFullYear(), month.getMonth(), day));
                }
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
