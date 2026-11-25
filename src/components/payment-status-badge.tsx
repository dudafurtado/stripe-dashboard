"use client";

import { Check, CircleMinus, Clock, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@/types/payment";

const dangerStatusStyle = "bg-[#FDECEE] border-[#F7B8C0] text-[#C81E3A]";

const statusStyles: Record<PaymentStatus, string> = {
  Succeeded: "bg-[#EAFAEA] border-[#A6E8A6] text-[#15803D]",
  Pending: "bg-[#FFFBEB] border-[#FCD34D] text-[#92400E]",
  Failed: dangerStatusStyle,
  Refunded: "bg-blue-700 text-white",
  Canceled: "bg-[#F1F5F9] border-[#CBD5E1] text-[#475569]",
  Blocked: dangerStatusStyle,
};

const statusIcons = {
  Succeeded: Check,
  Pending: Clock,
  Failed: X,
  Refunded: RotateCcw,
  Canceled: X,
  Blocked: CircleMinus,
} satisfies Record<PaymentStatus, typeof Check>;

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const Icon = statusIcons[status];
  return (
    <Badge variant="secondary" className={`h-auto rounded-lg px-3 py-1 ${statusStyles[status]}`}>
      {status}
      <Icon aria-hidden="true" />
    </Badge>
  );
}
