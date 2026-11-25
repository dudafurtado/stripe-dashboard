import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getMockPaymentDetails } from "@/data/mock-payment-details";
import { dateFormatter, formatAmount, paymentMethodLabel } from "@/lib/payment-format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Payment details | Stripe Payments Screen",
};

type PaymentPageProps = { params: Promise<{ id: string }> };

export default function PaymentPage({ params }: PaymentPageProps) {
  return (
    <>
      <div className="flex items-center gap-4">
        <SidebarTrigger size="icon" />
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to payments
        </Link>
      </div>

      <Suspense fallback={<p role="status" className="mt-8 text-sm text-muted-foreground">Loading payment details…</p>}>
        <PaymentDetails params={params} />
      </Suspense>
    </>
  );
}

async function PaymentDetails({ params }: PaymentPageProps) {
  const { id } = await params;
  const details = getMockPaymentDetails(id);
  if (!details) notFound();

  const { payment, events, metadata } = details;
  const { amount, currency } = formatAmount(payment);
  const summary = [
    { label: "Customer", value: <>{payment.customer.name}<br /><span className="text-muted-foreground">{payment.customer.email}</span></> },
    { label: "Payment method", value: `${paymentMethodLabel(payment)} •••• ${payment.card.last4}` },
    { label: "Created at", value: <time dateTime={payment.created}>{dateFormatter.format(new Date(payment.created))} UTC</time> },
  ];

  return (
    <>
      <header className="mt-8 mb-8">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Payment details</h1>
        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
            {amount} <span className="text-xl font-normal text-muted-foreground">{currency}</span>
          </p>
          <PaymentStatusBadge status={payment.status} />
        </div>
        <p className="font-mono text-xs break-all text-muted-foreground">{payment.id}</p>
      </header>

      <section aria-labelledby="payment-summary" className="mb-8 rounded-xl border bg-card p-5 sm:p-6">
        <h2 id="payment-summary" className="mb-4 text-base font-semibold">Summary</h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          {summary.map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <dt className="mb-1 text-sm text-muted-foreground">{label}</dt>
              <dd className="text-sm [overflow-wrap:anywhere]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="payment-timeline" className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 id="payment-timeline" className="mb-5 text-base font-semibold">Timeline</h2>
          <ol className="ml-1.5 border-s border-border">
            {events.map(event => (
              <li key={event.at} className="relative ps-5 pb-5 last:pb-0">
                <span className="absolute start-0 top-1.5 size-3 -translate-x-1/2 rounded-full border-2 border-card bg-primary" aria-hidden="true" />
                <h3 className="text-sm font-medium">{event.title}</h3>
                <time dateTime={event.at} className="mt-1 block text-xs text-muted-foreground">
                  {dateFormatter.format(new Date(event.at))} UTC
                </time>
                <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="payment-metadata" className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 id="payment-metadata" className="mb-4 text-base font-semibold">Metadata</h2>
          <dl className="divide-y">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2 first:pt-0 last:pb-0">
                <dt className="font-mono text-xs text-muted-foreground">{key}</dt>
                <dd className="font-mono text-xs break-all">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}
