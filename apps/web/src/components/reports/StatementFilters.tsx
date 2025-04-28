'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { StatementPeriod } from '@qbit/shared-types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, FilterIcon, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatementFiltersProps {
  onApplyFilters: (filters: StatementFilterValues) => void;
  isLoading?: boolean;
}

export interface StatementFilterValues {
  startDate: string;
  endDate: string;
  period: StatementPeriod;
  comparativePeriod: boolean;
  includeZeroBalances: boolean;
}

export function StatementFilters({ onApplyFilters, isLoading = false }: StatementFiltersProps) {
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

  const [startDate, setStartDate] = useState<Date>(firstDayOfYear);
  const [endDate, setEndDate] = useState<Date>(today);
  const [period, setPeriod] = useState<StatementPeriod>(StatementPeriod.MONTHLY);
  const [comparativePeriod, setComparativePeriod] = useState(false);
  const [includeZeroBalances, setIncludeZeroBalances] = useState(false);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  const handleApplyFilters = () => {
    onApplyFilters({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      period,
      comparativePeriod,
      includeZeroBalances,
    });
  };

  return (
    <div className="bg-background border rounded-md p-4 mb-6">
      <div className="flex items-center mb-4">
        <FilterIcon className="h-5 w-5 mr-2" />
        <h3 className="text-lg font-medium">Report Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                id="startDate"
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date || firstDayOfYear);
                  setIsStartDateOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
            <PopoverTrigger asChild>
              <Button
                id="endDate"
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date || today);
                  setIsEndDateOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="period">Period</Label>
          <Select value={period} onValueChange={(value) => setPeriod(value as StatementPeriod)}>
            <SelectTrigger id="period" className="w-full">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={StatementPeriod.DAILY}>Daily</SelectItem>
              <SelectItem value={StatementPeriod.WEEKLY}>Weekly</SelectItem>
              <SelectItem value={StatementPeriod.MONTHLY}>Monthly</SelectItem>
              <SelectItem value={StatementPeriod.QUARTERLY}>Quarterly</SelectItem>
              <SelectItem value={StatementPeriod.YEARLY}>Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="comparativePeriod"
            checked={comparativePeriod}
            onCheckedChange={setComparativePeriod}
          />
          <Label htmlFor="comparativePeriod">Show Comparative Period</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="includeZeroBalances"
            checked={includeZeroBalances}
            onCheckedChange={setIncludeZeroBalances}
          />
          <Label htmlFor="includeZeroBalances">Include Zero Balances</Label>
        </div>
      </div>

      <Button onClick={handleApplyFilters} disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          'Apply Filters'
        )}
      </Button>
    </div>
  );
}
