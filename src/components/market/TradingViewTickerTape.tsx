"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type TickerSymbol = {
  proName: string;
  title: string;
};

const DEFAULT_TICKER_SYMBOLS: TickerSymbol[] = [
  { proName: "BINANCE:BTCUSDT", title: "BTCUSD" },
  { proName: "BINANCE:ETHUSDT", title: "ETHUSD" },
  { proName: "BINANCE:SOLUSDT", title: "SOLUSD" },
  { proName: "BINANCE:XRPUSDT", title: "XRPUSD" },
  { proName: "BINANCE:BNBUSDT", title: "BNBUSD" },
];

type TradingViewTickerTapeProps = {
  symbols?: TickerSymbol[];
  className?: string;
};

export function TradingViewTickerTape({
  symbols = DEFAULT_TICKER_SYMBOLS,
  className,
}: TradingViewTickerTapeProps) {
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
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.type = "text/javascript";
    script.text = JSON.stringify({
      symbols,
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: "adaptive",
      colorTheme: resolvedTheme === "light" ? "light" : "dark",
      locale: "en",
    });

    widgetContainer.appendChild(widget);
    widgetContainer.appendChild(script);
    widgetRef.current.appendChild(widgetContainer);
  }, [resolvedTheme, symbols]);

  return (
    <section className={cn("overflow-hidden rounded-xl border border-border bg-background", className)}>
      <div
        ref={widgetRef}
        className="w-full [&_.tradingview-widget-container]:w-full [&_.tradingview-widget-container__widget]:w-full"
      />
    </section>
  );
}
