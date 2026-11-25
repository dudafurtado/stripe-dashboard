import Link from "next/link";

export default function PaymentNotFound() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Payment not found</h1>
      <p className="mb-4 text-sm text-muted-foreground">This payment ID does not match any payment.</p>
      <Link href="/" className="text-sm font-medium text-primary underline">
        Back to payments
      </Link>
    </div>
  );
}
