import type { Payment, PaymentMethod, PaymentStatus } from "../types/payment";

export type PaymentFilters = {
  query: string;
  date: "all" | "today" | "7" | "30" | "custom";
  from: string;
  to: string;
  statuses: PaymentStatus[];
  methods: PaymentMethod[];
  min: string;
  max: string;
};

export const emptyFilters: PaymentFilters = {
  query: "", date: "all", from: "", to: "", statuses: [], methods: [], min: "", max: "",
};

export const paymentStatuses = ["Succeeded", "Pending", "Failed", "Refunded", "Canceled", "Blocked"] satisfies PaymentStatus[];
export const paymentMethods = ["Card", "ACH", "Wallet"] satisfies PaymentMethod[];

const filterParams = {
  query: "q", date: "date", from: "from", to: "to", min: "min", max: "max",
} as const;
const textFilters = Object.keys(filterParams) as (keyof typeof filterParams)[];

function readDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(value) ? value : "";
}

export function readPaymentFilters(params: Pick<URLSearchParams, "get" | "getAll">): PaymentFilters {
  const date = params.get(filterParams.date);
  const statuses = params.getAll("status");
  const methods = params.getAll("method");
  return {
    query: params.get(filterParams.query) ?? "",
    date: date === "today" || date === "7" || date === "30" || date === "custom" ? date : "all",
    from: readDate(params.get(filterParams.from)),
    to: readDate(params.get(filterParams.to)),
    min: params.get(filterParams.min) ?? "",
    max: params.get(filterParams.max) ?? "",
    statuses: paymentStatuses.filter(status => statuses.includes(status)),
    methods: paymentMethods.filter(method => methods.includes(method)),
  };
}

export function writePaymentFilters(params: URLSearchParams, filters: PaymentFilters) {
  for (const key of textFilters) {
    const value = filters[key];
    if (value === emptyFilters[key]) params.delete(filterParams[key]);
    else params.set(filterParams[key], value);
  }
  params.delete("status");
  params.delete("method");
  for (const status of filters.statuses) params.append("status", status);
  for (const method of filters.methods) params.append("method", method);
}

export function filterError(filters: PaymentFilters) {
  if (filters.date === "custom" && filters.from && filters.to && filters.from > filters.to) return "Start date must be on or before end date.";
  if ([filters.min, filters.max].some(value => value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0))) return "Amounts must be positive numbers or zero.";
  if (filters.min !== "" && filters.max !== "" && Number(filters.min) > Number(filters.max)) return "Minimum amount must not exceed maximum amount.";
  return "";
}

/** Dates use UTC, matching the table. Amounts use each payment's own currency. */
export function filterPayments(payments: Payment[], filters: PaymentFilters, now: number): Payment[] {
  if (filterError(filters)) return [];
  const day = 86_400_000;
  let from = -Infinity;
  let to = Infinity;
  if (filters.date === "custom") {
    if (filters.from) from = Date.parse(`${filters.from}T00:00:00Z`);
    if (filters.to) to = Date.parse(`${filters.to}T00:00:00Z`) + day - 1;
  } else if (filters.date !== "all") {
    const today = Math.floor(now / day) * day;
    from = today - (filters.date === "today" ? 0 : Number(filters.date) - 1) * day;
    to = now;
  }
  const query = filters.query.trim().toLowerCase();
  return payments.filter(payment => {
    const created = Date.parse(payment.created);
    return (!query || [payment.id, payment.customer.email, payment.card.last4].some(value => value.toLowerCase().includes(query)))
      && (!filters.statuses.length || filters.statuses.includes(payment.status))
      && (!filters.methods.length || filters.methods.includes(payment.method))
      && (filters.min === "" || payment.amount >= Number(filters.min))
      && (filters.max === "" || payment.amount <= Number(filters.max))
      && created >= from && created <= to;
  });
}
