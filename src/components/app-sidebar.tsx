"use client";

import Image from "next/image";
import {
  ArrowLeftRight,
  BarChart3,
  ChartNoAxesCombined,
  CreditCard,
  Ellipsis,
  FileText,
  House,
  Network,
  Package,
  Radar,
  Receipt,
  Sigma,
  Users,
  Wallet,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationGroups = [
  {
    heading: null,
    items: [
      { label: "Home", icon: House },
      { label: "Balances", icon: Wallet },
      { label: "Transactions", icon: ArrowLeftRight },
      { label: "Customers", icon: Users },
      { label: "Product catalog", icon: Package },
    ],
  },
  {
    heading: "Shortcuts",
    items: [
      { label: "Payments analytics", icon: ChartNoAxesCombined },
      { label: "Reports", icon: FileText },
      { label: "Sigma", icon: Sigma },
      { label: "Radar", icon: Radar },
    ],
  },
  {
    heading: "Products",
    items: [
      { label: "Connect", icon: Network },
      { label: "Payments", icon: CreditCard },
      { label: "Billing", icon: Receipt },
      { label: "Reporting", icon: BarChart3 },
      { label: "More", icon: Ellipsis },
    ],
  },
] as const;

export type SidebarSection = (typeof navigationGroups)[number]["items"][number]["label"];

export function AppSidebar({
  selected,
  onSelect,
}: {
  selected: SidebarSection;
  onSelect: (section: SidebarSection) => void;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader className="flex-row items-center gap-2 p-4">
        <Image
          src="/stripe-payments-logo.png"
          alt=""
          width={32}
          height={32}
          className="shrink-0"
        />
        <div className="min-w-0 text-sm leading-tight">
          <div className="truncate font-semibold">duda.version</div>
          <div className="truncate text-xs text-sidebar-foreground/70">Stripe Payments Screen</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Dashboard navigation">
          {navigationGroups.map(({ heading, items }) => (
            <SidebarGroup key={heading ?? "primary"}>
              {heading && <SidebarGroupLabel>{heading}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {items.map(({ label, icon: Icon }) => (
                    <SidebarMenuItem key={label}>
                      <SidebarMenuButton
                        isActive={selected === label}
                        aria-current={selected === label ? "page" : undefined}
                        onClick={() => {
                          onSelect(label);
                          if (isMobile) setOpenMobile(false);
                        }}
                      >
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
