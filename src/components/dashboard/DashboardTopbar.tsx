"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  Bell,
  ChevronDown,
  House,
  LogOut,
  Menu,
  Settings2,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

type DashboardTopbarProps = {
  username: string;
  onMenuClick: () => void;
};

export function DashboardTopbar({ username, onMenuClick }: DashboardTopbarProps) {
  const initial = username?.trim().charAt(0).toUpperCase() || "U";
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLogout = () => {
    void signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="hidden items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition hover:border-primary hover:text-primary sm:inline-flex"
          >
            <House className="h-4 w-4" />
            Go Back
          </button>

          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground sm:hidden"
            aria-label="Go back home"
          >
            <House className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground md:hidden"
            aria-label="Open dashboard menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted hover:text-foreground"
              aria-label="Settings"
            >
              <Settings2 className="h-4 w-4" />
            </button>
            <div className="relative">
              <button
                type="button"
                className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 sm:flex"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                aria-label="Open profile menu"
              >
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background text-xs font-semibold text-primary">
                  {initial}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold leading-tight">{username}</p>
                  <p className="text-[11px] uppercase leading-tight text-muted">User</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted" />
              </button>

              {isProfileMenuOpen ? (
                <div className="absolute right-0 z-50 mt-2 w-44 rounded-lg border border-border bg-card p-1 shadow-lg">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-background"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {isLogoutConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg">
            <h4 className="text-lg font-semibold">Logout Required</h4>
            <p className="mt-2 text-sm text-muted">
              You need to log out before going back to the home page. Do you
              want to logout now?
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-secondary hover:opacity-90"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
