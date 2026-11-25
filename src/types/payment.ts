export type PaymentStatus = "Succeeded" | "Pending" | "Failed" | "Refunded" | "Canceled" | "Blocked";

export type PaymentMethod = "Card" | "ACH" | "Wallet";

export type Payment = {
  id: string;
  customer: { name: string; email: string };
  /** Amount in major currency units (for example, dollars). */
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  card: { brand: string; last4: string };
  created: string;
};

