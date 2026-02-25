"use client";

import { useState } from "react";
import {
  BadgeDollarSign,
  Mail,
  NotebookTabs,
  Settings,
  Shield,
  Wallet,
  X,
} from "lucide-react";
import { SidebarNav, type SidebarNavItem } from "@/components/dashboard/SidebarNav";
import { Logo } from "@/components/layout/Logo";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

type AdminShellProps = {
  username: string;
  children: React.ReactNode;
};

const adminSidebarItems: SidebarNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: Shield },
  { label: "Deposite request", href: "/admin/deposit-requests", icon: BadgeDollarSign },
  { label: "View Withdrawals", href: "/admin/withdrawals", icon: Wallet },
  { label: "Investments", href: "/admin/investments", icon: NotebookTabs },
  { label: "Send Mail", href: "/admin/mail", icon: Mail },
  { label: "Profile Settings", href: "/admin/profile", icon: Settings },
];

export function AdminShell({ username, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:block">
        <SidebarNav items={adminSidebarItems} />
      </div>

      <div className="md:pl-72">
        <div className="flex justify-center border-b border-border bg-background/90 px-4 py-3 md:hidden">
          <Logo width={124} height={36} />
        </div>

        <AdminTopbar username={username} onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 py-6 md:px-6">{children}</main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            aria-label="Close admin menu overlay"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full w-72">
            <div className="flex items-center justify-end px-3 pt-3">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card"
                aria-label="Close admin menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarNav
              items={adminSidebarItems}
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
