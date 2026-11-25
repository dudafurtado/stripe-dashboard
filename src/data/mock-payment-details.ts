import type { Payment, PaymentStatus } from "@/types/payment";
import { mockPayments } from "./mock-payments";

const statusEvents = {
  Succeeded: { title: "Payment succeeded", description: "The payment completed successfully." },
  Pending: { title: "Payment pending", description: "The payment is awaiting confirmation." },
  Failed: { title: "Payment failed", description: "The payment attempt did not complete." },
  Refunded: { title: "Payment refunded", description: "Funds were returned to the customer." },
  Canceled: { title: "Payment canceled", description: "The payment was canceled before completion." },
  Blocked: { title: "Payment blocked", description: "The payment was stopped before completion." },
} satisfies Record<PaymentStatus, { title: string; description: string }>;

type PaymentEvent = { title: string; description: string; at: string };

function sampleEvents(payment: Payment): PaymentEvent[] {
  const created = Date.parse(payment.created);
  const events = [{
    title: "Payment created",
    description: "The payment record was created.",
    at: payment.created,
  }];

  if (payment.status === "Refunded") {
    events.push({ ...statusEvents.Succeeded, at: new Date(created + 60_000).toISOString() });
  }

  const elapsed = payment.status === "Refunded" ? 1_800_000 : 90_000;
  events.push({ ...statusEvents[payment.status], at: new Date(created + elapsed).toISOString() });
  return events.reverse();
}

export function getMockPaymentDetails(id: string) {
  const payment = mockPayments.find(item => item.id === id);
  if (!payment) return undefined;

  return {
    payment,
    events: sampleEvents(payment),
    metadata: {
      order_reference: `order_${payment.id.slice(3, 9)}`,
      environment: "Demo",
    },
  };
}
