"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BriefcaseBusiness, Users, Wallet } from "lucide-react";

type StatItem = {
  label: string;
  endValue: number;
  suffix: "k" | "m";
  decimals: number;
  icon: LucideIcon;
};

const stats: StatItem[] = [
  { label: "Accounts", endValue: 13.7, suffix: "k", decimals: 1, icon: Users },
  { label: "Withdrawal", endValue: 739.1, suffix: "k", decimals: 1, icon: BriefcaseBusiness },
  { label: "Deposit", endValue: 1.6, suffix: "m", decimals: 1, icon: Wallet },
];

function formatDisplay(value: number, decimals: number, suffix: "k" | "m") {
  return `${value.toFixed(decimals)}${suffix}`;
}

export function AboutStatsStrip() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHasStarted(true);
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let frame = 0;
    let startTime: number | null = null;
    const duration = 1800;

    const run = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const normalized = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - normalized, 3);

      setProgress(eased);
      if (normalized < 1) frame = requestAnimationFrame(run);
    };

    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [hasStarted]);

  const values = useMemo(
    () => stats.map((item) => item.endValue * progress),
    [progress]
  );

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-14 md:px-6">
      <div
        ref={sectionRef}
        className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-4 md:justify-items-center"
      >
        {stats.map((stat, idx) => (
          <article
            key={stat.label}
            className={`flex items-center gap-3 px-2 py-1 md:gap-4 ${idx === 0 ? "col-span-2 justify-self-center sm:col-span-1 sm:justify-self-auto" : ""}`}
          >
            <stat.icon className="h-11 w-11 text-primary md:h-14 md:w-14" strokeWidth={1.9} />
            <div>
              <p className="text-3xl font-bold leading-none text-foreground md:text-4xl">
                {formatDisplay(values[idx], stat.decimals, stat.suffix)}
              </p>
              <p className="mt-1 text-lg font-medium leading-none text-primary md:text-[1.65rem]">
                {stat.label}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
