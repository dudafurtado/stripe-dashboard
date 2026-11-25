import { useState } from "react";
import { Check, Copy, CreditCard, Landmark, Wallet } from "lucide-react";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Column } from "@/lib/payment-columns";
import { dateFormatter, formatAmount, paymentMethodLabel } from "@/lib/payment-format";
import type { Payment } from "@/types/payment";

function relativeTime(created: string) {
  const seconds = (new Date(created).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000], ["month", 2592000], ["day", 86400],
    ["hour", 3600], ["minute", 60], ["second", 1],
  ];
  const [unit, divisor] = units.find(([, size]) => Math.abs(seconds) >= size) ?? units[units.length - 1];
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(Math.round(seconds / divisor), unit);
}

function PaymentId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  async function copyId() {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setMessage("Payment ID copied to clipboard.");
    } catch {
      setCopied(false);
      setMessage("Unable to copy. Select and copy the full ID below.");
    }
  }

  return (
    <div>
      <Tooltip>
        <TooltipTrigger render={<Button variant="ghost" size="sm" className="h-[50px]" />} onClick={copyId} aria-label={`Copy payment ID ${id}`} className="gap-2 font-mono font-normal">
          {id.slice(0, 10)}…{id.slice(-4)}
          {copied ? <Check className="text-emerald-600" aria-hidden="true" /> : <Copy className="text-muted-foreground" aria-hidden="true" />}
        </TooltipTrigger>
        <TooltipContent><span className="font-mono">{id}</span></TooltipContent>
      </Tooltip>
      <span className="sr-only" role="status">{message}</span>
      {message.startsWith("Unable") && <p className="max-w-64 whitespace-normal text-xs text-destructive">{message} <span className="select-all font-mono">{id}</span></p>}
    </div>
  );
}

function CreatedDate({ created }: { created: string }) {
  const [relative, setRelative] = useState("");
  return (
    <Tooltip onOpenChange={(open) => { if (open) setRelative(relativeTime(created)); }}>
      <TooltipTrigger className="cursor-help rounded-sm text-muted-foreground underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <time dateTime={created}>{dateFormatter.format(new Date(created))}</time>
      </TooltipTrigger>
      <TooltipContent>{relative}</TooltipContent>
    </Tooltip>
  );
}

export function PaymentCell({ payment, column }: { payment: Payment; column: Column }) {
  switch (column) {
    case "id":
      return <PaymentId id={payment.id} />;
    case "customer":
      return <><div className="truncate font-medium">{payment.customer.name}</div><div className="mt-0.5 truncate text-xs text-muted-foreground">{payment.customer.email}</div></>;
    case "amount": {
      const { amount, currency } = formatAmount(payment);
      return <>{amount} <span className="ms-1.5 font-normal text-muted-foreground">{currency}</span></>;
    }
    case "status":
      return <PaymentStatusBadge status={payment.status} />;
    case "method": {
      const Icon = payment.method === "ACH" ? Landmark : payment.method === "Wallet" ? Wallet : CreditCard;
      return <div className="flex items-center gap-2"><Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span>{paymentMethodLabel(payment)}</span><span className="text-muted-foreground">•••• {payment.card.last4}</span></div>;
    }
    case "created":
      return <CreatedDate created={payment.created} />;
  }
}
