"use client";

import { useState } from "react";
import {
  CircleDollarSign,
  HandCoins,
  History,
  LayoutDashboard,
  NotebookTabs,
  ScanSearch,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Logo } from "@/components/layout/Logo";
import { SidebarNav, type SidebarNavItem } from "@/components/dashboard/SidebarNav";

type DashboardShellProps = {
  username: string;
  children: React.ReactNode;
};

const sidebarItems: SidebarNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Make Deposit", href: "/dashboard/deposit", icon: Wallet },
  { label: "Deposit History", href: "/dashboard/deposit-history", icon: History },
  { label: "Investment Plans", href: "/dashboard/investment-plans", icon: NotebookTabs },
  { label: "Investment History", href: "/dashboard/investment-history", icon: ScanSearch },
  { label: "Request withdrawal", href: "/dashboard/request-withdrawal", icon: HandCoins },
  { label: "withdrawal History", href: "/dashboard/withdrawal-history", icon: CircleDollarSign },
  { label: "Refer a Friend", href: "/dashboard/refer", icon: UserPlus },
];

export function DashboardShell({ username, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:block">
        <SidebarNav items={sidebarItems} />
      </div>

      <div className="md:pl-72">
        <div className="flex justify-center border-b border-border bg-background/90 px-4 py-3 md:hidden">
          <Logo width={124} height={36} />
        </div>
        <DashboardTopbar username={username} onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 py-6 md:px-6">{children}</main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            aria-label="Close dashboard menu overlay"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full w-72">
            <div className="flex items-center justify-end px-3 pt-3">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card"
                aria-label="Close dashboard menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarNav
              items={sidebarItems}
              showLogo={false}
              className="h-[calc(100%-3.5rem)] border-r"
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
