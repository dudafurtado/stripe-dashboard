export const columnLabels = {
  amount: "Amount",
  status: "Status",
  method: "Payment method",
  customer: "Customer",
  id: "Payment ID",
  created: "Created at",
};

export type Column = keyof typeof columnLabels;
