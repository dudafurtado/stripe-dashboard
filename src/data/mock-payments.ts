import type { Payment, PaymentStatus } from "../types/payment";

// Fixed seed and reference date keep the mock data stable across reloads and SSR.
const REFERENCE_DATE = Date.parse("2026-11-24T21:00:00Z");
const DAY = 86_400_000;

function seededRandom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

const firstNames = ["Olivia", "Jackson", "Sofia", "Noah", "Emma", "Liam", "Isabella", "Lucas", "Amelia", "Mateo", "Ava", "Ethan", "Mia", "Rafael", "Charlotte", "Oliver", "Harper", "Daniel", "Camila", "James"];
const lastNames = ["Martin", "Lee", "Costa", "Williams", "Brown", "Chen", "Silva", "Garcia", "Patel", "Wilson", "Santos", "Kim", "Taylor", "Anderson", "Miller"];
const cardBrands = ["Visa", "Visa", "Mastercard", "Mastercard", "Amex", "Discover"];

// Independent, currency-specific price points in major units, not exchange rates.
const pricePoints = {
  USD: [9.99, 19, 29.99, 49, 79.95, 129, 249, 499, 1299],
  EUR: [8.99, 15, 24.99, 45, 69.9, 119, 229, 459, 1199],
  GBP: [7.99, 12, 19.99, 39, 59.95, 99, 199, 399, 999],
  BRL: [19.9, 39.9, 79.9, 149, 249.9, 499, 899, 1499, 4999],
  CAD: [12.99, 25, 39.99, 69, 109.95, 179, 349, 699, 1799],
  AUD: [14.99, 29, 44.99, 75, 119.95, 199, 379, 749, 1999],
  JPY: [500, 1200, 2500, 4800, 7900, 12800, 24900, 49800, 129800],
};
const currencies = Object.keys(pricePoints) as (keyof typeof pricePoints)[];

function generatePayments(count: number): Payment[] {
  const random = seededRandom(635);
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(random() * items.length)];
  const customers = Array.from({ length: 120 }, (_, index) => {
    const first = pick(firstNames);
    const last = pick(lastNames);
    return {
      customer: { name: `${first} ${last}`, email: `${first}.${last}${index + 1}@example.com`.toLowerCase() },
      currency: pick(currencies),
      card: { brand: pick(cardBrands), last4: String(Math.floor(random() * 10000)).padStart(4, "0") },
    };
  });

  return Array.from({ length: count }, (_, index): Payment => {
    const customer = pick(customers);
    const statusRoll = random();
    const status: PaymentStatus =
      statusRoll < 0.72 ? "Succeeded" :
      statusRoll < 0.82 ? "Pending" :
      statusRoll < 0.88 ? "Failed" :
      statusRoll < 0.92 ? "Blocked" :
      statusRoll < 0.96 ? "Refunded" : "Canceled";
    // Pending payments are recent; settled payments span the previous 90 days.
    const age = random() * (status === "Pending" ? 2 : 90) * DAY;
    const quantity = pick([1, 1, 1, 1, 2, 3]);
    const amount = Number((pick(pricePoints[customer.currency]) * quantity).toFixed(customer.currency === "JPY" ? 0 : 2));
    const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const suffix = Array.from({ length: 18 }, () => pick([...alphabet])).join("");
    return {
      id: `pi_${(index + 1).toString(36).padStart(6, "0")}${suffix}`,
      customer: customer.customer,
      amount,
      currency: customer.currency,
      status,
      method: index % 10 === 0 && customer.currency === "USD" ? "ACH" : index % 4 === 0 ? "Wallet" : "Card",
      card: customer.card,
      created: new Date(REFERENCE_DATE - age).toISOString(),
    };
  }).sort((a, b) => b.created.localeCompare(a.created));
}

/** Fictional, reproducible payments for local pagination and filtering. */
export const mockPayments = generatePayments(500);
