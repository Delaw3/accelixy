"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { GlobalLoadingSignal } from "@/components/providers/global-loading-signal";
import { SessionProvider } from "next-auth/react";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <GlobalLoadingSignal />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
