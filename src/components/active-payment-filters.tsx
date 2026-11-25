import { X } from "lucide-react";
import type { PaymentFilterProps } from "@/components/payment-filters";
import { Badge } from "@/components/ui/badge";
import type { PaymentFilters } from "@/lib/payment-filters";

const dateLabels = {
  today: "Today",
  "7": "Last 7 days",
  "30": "Last 30 days",
  custom: "Custom dates",
};

export function ActivePaymentFilters({ filters, onChange }: PaymentFilterProps) {
  const badges: { key: string; label: string; changes: Partial<PaymentFilters> }[] = [];
  const query = filters.query.trim();
  if (query) badges.push({ key: "search", label: `Search: ${query}`, changes: { query: "" } });
  if (filters.date !== "all") {
    let label = dateLabels[filters.date];
    if (filters.date === "custom") {
      if (filters.from && filters.to) label = `${filters.from} – ${filters.to}`;
      else if (filters.from) label = `From ${filters.from}`;
      else if (filters.to) label = `Through ${filters.to}`;
    }
    badges.push({ key: "date", label, changes: { date: "all", from: "", to: "" } });
  }
  for (const status of filters.statuses) {
    badges.push({
      key: `status-${status}`, label: status,
      changes: { statuses: filters.statuses.filter(item => item !== status) },
    });
  }
  for (const method of filters.methods) {
    badges.push({
      key: `method-${method}`, label: method,
      changes: { methods: filters.methods.filter(item => item !== method) },
    });
  }
  if (filters.min !== "") badges.push({ key: "min", label: `Min amount: ${filters.min}`, changes: { min: "" } });
  if (filters.max !== "") badges.push({ key: "max", label: `Max amount: ${filters.max}`, changes: { max: "" } });
  if (!badges.length) return null;

  return (
    <ul aria-label="Active payment filters" className="mb-8 flex min-w-0 flex-wrap items-center gap-2 md:mb-0">
      {badges.map(({ key, label, changes }) => (
        <li key={key} className="min-w-0 max-w-full">
          <Badge variant="secondary" className="h-8 max-w-full gap-1.5 pl-3 pr-1">
            <span className="min-w-0 truncate" title={label}>{label}</span>
            <button
              type="button"
              aria-label={`Remove filter: ${label}`}
              className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-ring"
              onClick={() => onChange({ ...filters, ...changes })}
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </Badge>
        </li>
      ))}
    </ul>
  );
}
