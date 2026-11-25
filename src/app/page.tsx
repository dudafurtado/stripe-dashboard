"use client";

import { useDashboardSection } from "@/components/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard-header";
import { TransactionsSection } from "@/components/transactions-section";

export default function Home() {
  const selectedSection = useDashboardSection();

  return (
    <>
      <DashboardHeader />
      {selectedSection === "Transactions" && <TransactionsSection />}
    </>
  );
}
