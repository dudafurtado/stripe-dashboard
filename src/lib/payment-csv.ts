import { columnLabels, type Column } from "@/lib/payment-columns";
import { dateFormatter, formatAmount, paymentMethodLabel } from "@/lib/payment-format";
import type { Payment } from "@/types/payment";

const csvValues: Record<Column, (payment: Payment) => string> = {
  id: payment => payment.id,
  customer: payment => `${payment.customer.name} <${payment.customer.email}>`,
  amount: payment => {
    const { amount, currency } = formatAmount(payment);
    return `${amount} ${currency}`;
  },
  status: payment => payment.status,
  method: payment => `${paymentMethodLabel(payment)} •••• ${payment.card.last4}`,
  created: payment => dateFormatter.format(new Date(payment.created)),
};

function csvField(value: string) {
  // Keep spreadsheet apps from evaluating text fields as formulas.
  const text = /^[=+@-]/.test(value.trimStart()) || /^[\t\r\n]/.test(value) ? `'${value}` : value;
  return `"${text.replaceAll('"', '""')}"`;
}

export function exportPaymentsCsv(payments: Payment[], columns: Column[]) {
  const rows = [columns.map(column => columnLabels[column])];
  for (const payment of payments) {
    rows.push(columns.map(column => csvValues[column](payment)));
  }

  const csv = rows.map(row => row.map(csvField).join(",")).join("\r\n") + "\r\n";
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "payments.csv";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
