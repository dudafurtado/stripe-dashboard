"use client";

import { startTransition, useId, useOptimistic, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Download, Eye, GripVertical } from "lucide-react";
import { PaymentCell } from "@/components/payment-cell";
import { Button, buttonVariants } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ActivePaymentFilters } from "@/components/active-payment-filters";
import { PaymentFilterBar } from "@/components/payment-filters";
import { filterError, filterPayments, readPaymentFilters, writePaymentFilters, type PaymentFilters } from "@/lib/payment-filters";

import { mockPayments } from "@/data/mock-payments";
import {
  actionColumnWidth,
  maxColumnWidth,
  minColumnWidth,
  selectionColumnWidth,
  usePaymentColumns,
} from "@/hooks/use-payment-columns";
import { columnLabels, type Column } from "@/lib/payment-columns";
import { exportPaymentsCsv } from "@/lib/payment-csv";
import type { Payment } from "@/types/payment";

const paymentComparators = {
  id: (a: Payment, b: Payment) => a.id.localeCompare(b.id, "en"),
  customer: (a: Payment, b: Payment) => a.customer.name.localeCompare(b.customer.name, "en"),
  amount: (a: Payment, b: Payment) => a.amount - b.amount,
  status: (a: Payment, b: Payment) => a.status.localeCompare(b.status, "en"),
  created: (a: Payment, b: Payment) => Date.parse(a.created) - Date.parse(b.created),
};

type SortColumn = keyof typeof paymentComparators;
type PaymentSort = { column: SortColumn; direction: "ascending" | "descending" };

const checkboxClassName = "size-4 cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50";

function isSortable(column: Column): column is SortColumn {
  return column !== "method";
}

export function PaymentsTable({ payments = mockPayments }: { payments?: Payment[] }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const pageSizeId = useId();
  const reorderHelpId = useId();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useOptimistic(readPaymentFilters(searchParams));
  const [filterTime, setFilterTime] = useState(() => Date.now());
  const [sort, setSort] = useState<PaymentSort | null>(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set<string>());
  const {
    columns, visibleColumns, widths, columnWidths, tableWidth, headerRow,
    dropTarget, columnAnnouncement, startReorder, reorderWithKeyboard,
    startResize, resizeWithKeyboard, setColumnVisible,
  } = usePaymentColumns();

  const hasFilterError = Boolean(filterError(filters));
  const filteredPayments = filterPayments(payments, filters, filterTime);
  if (sort) {
    const compare = paymentComparators[sort.column];
    const direction = sort.direction === "ascending" ? 1 : -1;
    filteredPayments.sort((a, b) => direction * compare(a, b));
  }
  const total = filteredPayments.length;
  const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1);
  const currentPage = Math.min(page, lastPage);
  const start = currentPage * pageSize;
  const end = Math.min(start + pageSize, total);
  const visiblePayments = filteredPayments.slice(start, end);
  const selectedPayments = visiblePayments.filter(payment => selectedIds.has(payment.id));
  const selectedOnPage = selectedPayments.length;
  const allSelectedOnPage = visiblePayments.length > 0 && selectedOnPage === visiblePayments.length;

  function updateFilters(next: PaymentFilters) {
    const url = new URL(window.location.href);
    writePaymentFilters(url.searchParams, next);
    startTransition(() => {
      setFilters(next);
      window.history.replaceState(null, "", url);
    });
    setFilterTime(Date.now());
    setPage(0);
  }

  function updateSelection(ids: string[], checked: boolean) {
    setSelectedIds(previous => {
      const next = new Set(previous);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function renderHeader(column: Column, index: number) {
    const label = columnLabels[column];
    const direction = sort?.column === column ? sort.direction : undefined;
    const SortIcon = direction === "ascending" ? ArrowUp : direction === "descending" ? ArrowDown : ArrowUpDown;
    const dropSide = dropTarget?.column === column ? dropTarget.side : undefined;

    return (
      <TableHead key={column} scope="col" data-column={column} aria-sort={direction}
        className="relative px-2"
      >
        <div className={`flex min-w-0 items-center gap-1 pr-2 ${column === "amount" ? "justify-end" : ""}`}>
          <button type="button"
            aria-label={`Reorder ${label} column`}
            aria-describedby={reorderHelpId}
            title={`Drag to reorder ${label}`}
            className="inline-flex h-[50px] w-5 shrink-0 touch-none items-center justify-center rounded cursor-grab text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
            onPointerDown={event => startReorder(event, column)}
            onKeyDown={event => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
              event.preventDefault();
              reorderWithKeyboard(column, index, event.key);
            }}
          >
            <GripVertical className="pointer-events-none size-4" aria-hidden="true" />
          </button>
          {isSortable(column) ? (
            <Button variant="ghost" className="min-w-0 shrink px-2" title={`Sort by ${label}`} onClick={() => {
              setSort({ column, direction: direction === "ascending" ? "descending" : "ascending" });
              setPage(0);
            }}>
              <span className="truncate">{label}</span>
              <SortIcon className={direction ? "size-4" : "size-4 text-muted-foreground"} aria-hidden="true" />
            </Button>
          ) : <span className="truncate" title={label}>{label}</span>}
        </div>
        <div role="separator" tabIndex={0} aria-orientation="vertical" aria-label={`Resize ${label} column`}
          aria-valuemin={minColumnWidth} aria-valuemax={maxColumnWidth} aria-valuenow={Math.round(widths[column])}
          title={`Drag to resize ${label}`}
          className="absolute inset-y-1 right-0 z-10 flex w-3 touch-none cursor-col-resize items-center justify-center rounded hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring"
          onPointerDown={event => startResize(event, column)}
          onKeyDown={event => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            resizeWithKeyboard(column, event.key);
          }}
        >
          <span className="pointer-events-none h-4 w-px bg-border" aria-hidden="true" />
        </div>
        {dropSide && <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-primary ${dropSide === "before" ? "left-0" : "right-0"}`} />}
      </TableHead>
    );
  }

  return (
    <TooltipProvider>
      <PaymentFilterBar filters={filters} onChange={updateFilters} />
      <div className="mb-3 flex flex-col md:flex-row md:items-center md:gap-2">
        <ActivePaymentFilters filters={filters} onChange={updateFilters} />
        <div className="ml-auto flex shrink-0 flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            disabled={selectedOnPage === 0}
            onClick={() => exportPaymentsCsv(selectedPayments, visibleColumns)}
          >
            <Download aria-hidden="true" />
            Export CSV
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              Edit columns
              <ChevronDown aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44" aria-label="Edit columns">
              {columns.map(column => {
                const visible = visibleColumns.includes(column);
                return (
                  <DropdownMenuCheckboxItem
                    key={column}
                    checked={visible}
                    disabled={visible && visibleColumns.length === 1}
                    closeOnClick={false}
                    onCheckedChange={checked => setColumnVisible(column, checked)}
                  >
                    {columnLabels[column]}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <p id={reorderHelpId} className="sr-only">Use the left and right arrow keys to move this column.</p>
      <p role="status" className="sr-only">{columnAnnouncement}</p>
      <div className="min-w-0 bg-card">
        <Table className={columnWidths ? "table-fixed" : "table-fixed min-w-full"} style={{ width: tableWidth }}>
          <TableCaption className="sr-only">Payments. Created dates are displayed in UTC.</TableCaption>
          <colgroup>
            <col style={{ width: selectionColumnWidth }} />
            {visibleColumns.map(column => <col key={column} style={{ width: widths[column] }} />)}
            <col style={{ width: actionColumnWidth }} />
          </colgroup>
          <TableHeader className="bg-muted/40">
            <TableRow ref={headerRow}>
              <TableHead scope="col" className="px-0 text-center">
                <input
                  type="checkbox"
                  aria-label="Select all payments on this page"
                  className={checkboxClassName}
                  checked={allSelectedOnPage}
                  disabled={visiblePayments.length === 0}
                  ref={input => {
                    if (input) input.indeterminate = selectedOnPage > 0 && !allSelectedOnPage;
                  }}
                  onChange={event => updateSelection(visiblePayments.map(payment => payment.id), event.target.checked)}
                />
              </TableHead>
              {visibleColumns.map(renderHeader)}
              <TableHead scope="col" className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visiblePayments.map(payment => (
              <TableRow key={payment.id} data-state={selectedIds.has(payment.id) ? "selected" : undefined}>
                <TableCell className="px-0 text-center">
                  <input
                    type="checkbox"
                    aria-label={`Select payment ${payment.id}`}
                    className={checkboxClassName}
                    checked={selectedIds.has(payment.id)}
                    onChange={event => updateSelection([payment.id], event.target.checked)}
                  />
                </TableCell>
                {visibleColumns.map(column => (
                  <TableCell key={column} className={`overflow-hidden ${column === "id" ? "py-4 pl-3" : ""} ${column === "amount" ? "text-right font-medium tabular-nums" : ""}`}>
                    <PaymentCell payment={payment} column={column} />
                  </TableCell>
                ))}
                <TableCell className="text-center">
                  <Link
                    href={`/payments/${encodeURIComponent(payment.id)}`}
                    aria-label={`View payment ${payment.id}`}
                    title="View payment details"
                    className={buttonVariants({ variant: "ghost", size: "icon" })}
                  >
                    <Eye aria-hidden="true" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {total === 0 && (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 2} className="h-32 text-center text-muted-foreground">
                  {hasFilterError
                    ? "Correct the filter range to view payments."
                    : "No payments match your filters."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {!hasFilterError && <>Viewing {total === 0 ? 0 : start + 1}–{end} of {total} results</>}
        </p>
        <nav aria-label="Payments pagination" className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <label htmlFor={pageSizeId} className="mr-1 text-sm text-muted-foreground">
            Rows per page
          </label>
          <NativeSelect
            id={pageSizeId}
            value={pageSize}
            className="mr-2"
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(0);
            }}
          >
            {[25, 50, 100].map((size) => (
              <NativeSelectOption key={size} value={size}>{size}</NativeSelectOption>
            ))}
          </NativeSelect>
          <Button
            variant="outline"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={currentPage === lastPage}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </nav>
      </div>
    </TooltipProvider>
  );
}
