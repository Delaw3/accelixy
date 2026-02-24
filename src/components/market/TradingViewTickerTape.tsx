"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const TICKER_SYMBOLS = [
  { proName: "BINANCE:BTCUSDT", title: "BTCUSD" },
  { proName: "BINANCE:ETHUSDT", title: "ETHUSD" },
  { proName: "BINANCE:SOLUSDT", title: "SOLUSD" },
  { proName: "BINANCE:XRPUSDT", title: "XRPUSD" },
  { proName: "BINANCE:BNBUSDT", title: "BNBUSD" },
];

export function TradingViewTickerTape() {
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
      symbols: TICKER_SYMBOLS,
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: "adaptive",
      colorTheme: resolvedTheme === "light" ? "light" : "dark",
      locale: "en",
    });

    widgetContainer.appendChild(widget);
    widgetContainer.appendChild(script);
    widgetRef.current.appendChild(widgetContainer);
  }, [resolvedTheme]);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-background">
      <div
        ref={widgetRef}
        className="w-full [&_.tradingview-widget-container]:w-full [&_.tradingview-widget-container__widget]:w-full"
      />
    </section>
  );
}
