"use client";

import { useId } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  filterError,
  paymentMethods,
  paymentStatuses,
  type PaymentFilters,
} from "@/lib/payment-filters";

export type PaymentFilterProps = {
  filters: PaymentFilters;
  onChange: (filters: PaymentFilters) => void;
};

function MultiSelect<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: T[];
  selected: T[];
  onChange: (values: T[]) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline-neutral" className="w-full justify-between px-3.5" />
        }
      >
        <span className="truncate">
          {label}
          {selected.length > 0 && ` (${selected.length})`}
        </span>
        <ChevronDown aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-44" aria-label={label}>
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={selected.includes(option)}
            closeOnClick={false}
            onCheckedChange={(checked) =>
              onChange(
                checked
                  ? [...selected, option]
                  : selected.filter((value) => value !== option),
              )
            }
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PaymentFilterBar({
  filters,
  onChange,
}: PaymentFilterProps) {
  const amountHelpId = useId();
  const error = filterError(filters);
  return (
    <section
      aria-label="Payment filters"
      className="@container mb-8 space-y-3"
    >
      <div className="grid w-full grid-cols-2 items-end gap-2 @xl:grid-cols-[2fr_1fr_1fr] @min-[52rem]:grid-cols-[minmax(21rem,2.8fr)_1fr_minmax(8.5rem,1.25fr)_minmax(15rem,2fr)]">
        <div className="col-span-full grid grid-cols-[minmax(0,1fr)_auto] gap-2 @xl:col-span-1">
          <div className="relative min-w-0">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              aria-label="Search payments by ID, email or last 4 digits"
              placeholder="Payment ID, email or last 4 digits"
              className="pl-9"
              value={filters.query}
              onChange={(event) =>
                onChange({ ...filters, query: event.target.value })
              }
            />
          </div>
          <NativeSelect
            aria-label="Date range (UTC)"
            value={filters.date}
            onChange={(event) =>
              onChange({
                ...filters,
                date: event.target.value as PaymentFilters["date"],
              })
            }
          >
            <NativeSelectOption value="all">All dates</NativeSelectOption>
            <NativeSelectOption value="today">Today</NativeSelectOption>
            <NativeSelectOption value="7">7 days</NativeSelectOption>
            <NativeSelectOption value="30">30 days</NativeSelectOption>
            <NativeSelectOption value="custom">Custom</NativeSelectOption>
          </NativeSelect>
        </div>
        <MultiSelect
          label="Status"
          options={paymentStatuses}
          selected={filters.statuses}
          onChange={(statuses) => onChange({ ...filters, statuses })}
        />
        <MultiSelect
          label="Payment method"
          options={paymentMethods}
          selected={filters.methods}
          onChange={(methods) => onChange({ ...filters, methods })}
        />
        <fieldset
          aria-describedby={amountHelpId}
          className="col-span-full flex min-w-0 items-center gap-2 @min-[52rem]:col-span-1"
        >
          <legend className="mb-1 text-xs text-muted-foreground">
            Amount range
          </legend>
          <Input
            type="number"
            min="0"
            step="any"
            aria-label="Minimum amount"
            placeholder="Min amount"
            className="flex-1"
            value={filters.min}
            onChange={(event) =>
              onChange({ ...filters, min: event.target.value })
            }
          />
          <span className="text-muted-foreground" aria-hidden="true">
            –
          </span>
          <Input
            type="number"
            min="0"
            step="any"
            aria-label="Maximum amount"
            placeholder="Max amount"
            className="flex-1"
            value={filters.max}
            onChange={(event) =>
              onChange({ ...filters, max: event.target.value })
            }
          />
        </fieldset>
        <p id={amountHelpId} className="col-span-full text-xs text-muted-foreground @min-[52rem]:col-span-1 @min-[52rem]:col-start-4">
          Amounts use each payment’s original currency.
        </p>
      </div>
      {filters.date === "custom" && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-1 text-xs text-muted-foreground">
            From (UTC)
            <Input
              type="date"
              aria-label="Start date (UTC)"
              max={filters.to || undefined}
              value={filters.from}
              onChange={(event) =>
                onChange({ ...filters, from: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            To (UTC)
            <Input
              type="date"
              aria-label="End date (UTC)"
              min={filters.from || undefined}
              value={filters.to}
              onChange={(event) =>
                onChange({ ...filters, to: event.target.value })
              }
            />
          </label>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
