import { Suspense } from "react";
import { PaymentsTable } from "@/components/payments-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartNoAxesCombined, Plus } from "lucide-react";

export function TransactionsSection() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Transactions
        </h1>
        <div className="flex items-center gap-2">
          <Button
            size="lg"
            className="focus-visible:border-primary focus-visible:ring-primary/50"
          >
            <Plus aria-hidden="true" />
            Create payments
          </Button>
          <Button
            variant="outline"
            size="lg"
          >
            <ChartNoAxesCombined aria-hidden="true" />
            Analyze
          </Button>
        </div>
      </div>

      <Tabs defaultValue="payments" className="gap-10">
        <div className="overflow-x-auto border-b">
          <TabsList
            variant="line"
            aria-label="Transaction type"
            className="[&_[data-slot=tabs-trigger][data-active]]:text-primary [&_[data-slot=tabs-trigger][data-active]]:after:bg-primary"
          >
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="top-ups">Top-ups</TabsTrigger>
            <TabsTrigger value="collected-fees">
              Collected fees
            </TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
            <TabsTrigger value="all-activity">All activity</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="payments">
          <Suspense
            fallback={
              <p
                role="status"
                className="text-sm text-muted-foreground"
              >
                Loading payments…
              </p>
            }
          >
            <PaymentsTable />
          </Suspense>
        </TabsContent>
        <TabsContent value="payouts" />
        <TabsContent value="top-ups" />
        <TabsContent value="collected-fees" />
        <TabsContent value="transfers" />
        <TabsContent value="all-activity" />
      </Tabs>
    </>
  );
}
