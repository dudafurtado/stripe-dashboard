"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar, type SidebarSection } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const DashboardSectionContext = createContext<SidebarSection>("Transactions");

export function useDashboardSection() {
  return useContext(DashboardSectionContext);
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const [section, setSection] = useState<SidebarSection>("Transactions");
  const router = useRouter();

  return (
    <SidebarProvider>
      <AppSidebar
        selected={section}
        onSelect={next => {
          setSection(next);
          if (window.location.pathname !== "/") router.push("/");
        }}
      />
      <SidebarInset className="min-w-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
          <DashboardSectionContext value={section}>
            {children}
          </DashboardSectionContext>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
