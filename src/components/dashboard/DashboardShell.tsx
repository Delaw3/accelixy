"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
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
  role: "USER" | "ADMIN";
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

const userSidebarBannerSrc =
  "https://lagpvwdlpjmuuxzukczh.supabase.co/storage/v1/object/public/Accelixy-Bucket/pictures/navbar.png";

export function DashboardShell({ username, role, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isBackLogoutConfirmOpen, setIsBackLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    const guardState = { dashboardBackGuard: true };
    window.history.pushState(guardState, "", window.location.href);

    const onPopState = () => {
      window.history.pushState(guardState, "", window.location.href);
      setIsBackLogoutConfirmOpen(true);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleLogoutFromBackPrompt = () => {
    void signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:block">
        <SidebarNav items={sidebarItems} bannerSrc={userSidebarBannerSrc} />
      </div>

      <div className="md:pl-72">
        <div className="flex justify-center border-b border-border bg-background/90 px-4 py-3 md:hidden">
          <Logo width={124} height={36} />
        </div>
        <DashboardTopbar username={username} role={role} onMenuClick={() => setMobileOpen(true)} />
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
              bannerSrc={userSidebarBannerSrc}
              showLogo={false}
              className="h-[calc(100%-3.5rem)] border-r"
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {isBackLogoutConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg">
            <h4 className="text-lg font-semibold">Confirm Logout</h4>
            <p className="mt-2 text-sm text-muted">
              You pressed the browser back button. Do you want to logout and leave the dashboard?
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBackLogoutConfirmOpen(false)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary"
              >
                Stay Here
              </button>
              <button
                type="button"
                onClick={handleLogoutFromBackPrompt}
                className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-secondary hover:opacity-90"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
