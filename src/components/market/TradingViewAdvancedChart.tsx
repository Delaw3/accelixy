"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type TradingViewAdvancedChartProps = {
  symbol?: string;
  interval?: string;
  className?: string;
};

export function TradingViewAdvancedChart({
  symbol = "BINANCE:BTCUSDT",
  interval = "240",
  className,
}: TradingViewAdvancedChartProps) {
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!widgetRef.current) {
      return;
    }

    widgetRef.current.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.type = "text/javascript";
    script.text = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme: resolvedTheme === "light" ? "light" : "dark",
      style: "1",
      locale: "en",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      backgroundColor: "rgba(0, 0, 0, 0)",
      allow_symbol_change: true,
      support_host: "https://www.tradingview.com",
    });

    widgetContainer.appendChild(widget);
    widgetContainer.appendChild(script);
    widgetRef.current.appendChild(widgetContainer);
  }, [interval, resolvedTheme, symbol]);

  return (
    <section className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <div className="border-b border-border bg-background/60 px-4 py-3 backdrop-blur-sm md:px-5">
        <h3 className="text-base font-semibold md:text-lg">Live TradingView Chart</h3>
        <p className="text-xs text-muted md:text-sm">
          Interactive crypto chart powered by TradingView data.
        </p>
      </div>
      <div
        ref={widgetRef}
        className="h-[430px] w-full [&_.tradingview-widget-container]:h-full [&_.tradingview-widget-container]:w-full [&_.tradingview-widget-container__widget]:h-full [&_.tradingview-widget-container__widget]:w-full"
      />
    </section>
  );
}
