"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const FALLBACK_HIDE_MS = 2200;

export function GlobalLoadingSignal() {
  const [isLoading, setIsLoading] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const showLoader = () => {
      setIsLoading(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = setTimeout(() => {
        setIsLoading(false);
        hideTimerRef.current = null;
      }, FALLBACK_HIDE_MS);
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const link = target.closest("a[href]") as HTMLAnchorElement | null;
      if (link) {
        const href = link.getAttribute("href") ?? "";
        if (href.startsWith("#") || href.startsWith("javascript:")) {
          return;
        }
        showLoader();
        return;
      }

      const button = target.closest("button") as HTMLButtonElement | null;
      if (button && (button.type === "submit" || button.dataset.loading === "true")) {
        showLoader();
      }
    };

    const onSubmit = () => {
      showLoader();
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-0.5 overflow-hidden">
        <div className="h-full w-full origin-left animate-[loadingBar_1.2s_ease-in-out_infinite] bg-gradient-to-r from-primaryGradientStart via-primary to-primaryGradientEnd" />
      </div>
      <div className="pointer-events-none fixed inset-0 z-[119] flex items-center justify-center">
        {isHomePage ? (
          <div className="relative flex items-center justify-center">
            <div className="absolute h-28 w-28 animate-pulse rounded-full bg-primary/15 blur-xl" />
            <Image
              src="/brand/Logo.png"
              alt="Accelixy"
              width={220}
              height={66}
              priority
              className="h-auto w-[170px] animate-[logoFloat_1.2s_ease-in-out_infinite]"
            />
          </div>
        ) : (
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-border border-t-primary bg-card/75 shadow-lg backdrop-blur-sm" />
        )}
      </div>
    </>
  );
}
