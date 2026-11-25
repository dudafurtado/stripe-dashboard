import type { Payment } from "@/types/payment";

export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric",
  hour: "numeric", minute: "2-digit", timeZone: "UTC",
});

export function formatAmount(payment: Payment) {
  const parts = new Intl.NumberFormat("en-US", {
    style: "currency", currency: payment.currency, currencyDisplay: "code",
  }).formatToParts(payment.amount);
  const amount = parts.filter(part => part.type !== "currency").map(part => part.value).join("").trim();
  const currency = parts.find(part => part.type === "currency")?.value ?? payment.currency;
  return { amount, currency };
}

export function paymentMethodLabel(payment: Payment) {
  if (payment.method === "ACH") return "ACH";
  return payment.method === "Wallet" ? `Wallet · ${payment.card.brand}` : payment.card.brand;
}
