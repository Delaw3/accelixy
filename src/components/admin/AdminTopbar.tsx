"use client";

import { LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";

type AdminTopbarProps = {
  username: string;
  onMenuClick: () => void;
};

export function AdminTopbar({ username, onMenuClick }: AdminTopbarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = () => {
    void signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground md:hidden"
            aria-label="Open admin menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <p className="text-sm text-muted">Admin</p>
            <h2 className="text-base font-semibold">{username}</h2>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" className="gap-2" onClick={() => setConfirmOpen(true)}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg">
            <h4 className="text-lg font-semibold">Confirm Logout</h4>
            <p className="mt-2 text-sm text-muted">Are you sure you want to logout?</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="gradient" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
