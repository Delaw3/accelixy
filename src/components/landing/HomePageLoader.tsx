"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const INTRO_DURATION_MS = 2200;

type HomePageLoaderProps = {
  children: React.ReactNode;
};

export function HomePageLoader({ children }: HomePageLoaderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReady(true);
    }, INTRO_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (ready) {
    return <>{children}</>;
  }

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-background"
      aria-hidden="true"
    >
      <div className="relative flex flex-col items-center justify-center gap-4">
        <div className="absolute h-28 w-28 animate-pulse rounded-full bg-primary/15 blur-xl" />
        <Image
          src="/brand/logo.png"
          alt="Accelixy"
          width={180}
          height={54}
          priority
          className="h-auto w-[180px] animate-[logoDance_1.4s_ease-in-out_infinite]"
        />
        <div className="flex items-center justify-center gap-2">
          <span className="loader-bubble loader-bubble-1" />
          <span className="loader-bubble loader-bubble-2" />
          <span className="loader-bubble loader-bubble-3" />
        </div>
      </div>
    </div>
  );
}
