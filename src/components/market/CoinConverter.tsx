"use client";

import { ArrowUpDown, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { COIN_IDS_PARAM, COINS, type CoinId, type CoinSymbol } from "@/lib/market/coins";
import { fetchJson } from "@/lib/market/fetch-json";

type CoinGeckoPriceResponse = Record<CoinId, { usd: number }>;

type RateBySymbol = Record<CoinSymbol, number>;

const REFRESH_INTERVAL_MS = 60_000;

function formatNumber(value: number, maximumFractionDigits = 6) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

export function CoinConverter() {
  const [amount, setAmount] = useState<number>(1);
  const [fromCoin, setFromCoin] = useState<CoinSymbol>("BTC");
  const [toCoin, setToCoin] = useState<CoinSymbol>("ETH");
  const [rates, setRates] = useState<RateBySymbol | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COIN_IDS_PARAM}&vs_currencies=usd`;
      const data = await fetchJson<CoinGeckoPriceResponse>(url, { timeoutMs: 12_000 });

      const parsedRates = COINS.reduce<RateBySymbol>((acc, coin) => {
        acc[coin.symbol] = data[coin.id]?.usd ?? 0;
        return acc;
      }, {} as RateBySymbol);

      setRates(parsedRates);
      setLastUpdated(new Date());
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch market rates.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchRates();

    const interval = setInterval(() => {
      void fetchRates();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchRates]);

  const convertedAmount = useMemo(() => {
    if (!rates) {
      return null;
    }

    const fromUsd = rates[fromCoin];
    const toUsd = rates[toCoin];

    if (!fromUsd || !toUsd || amount <= 0) {
      return 0;
    }

    return amount * (fromUsd / toUsd);
  }, [amount, fromCoin, toCoin, rates]);

  const fiatValue = useMemo(() => {
    if (!rates || amount <= 0) {
      return 0;
    }

    return amount * (rates[fromCoin] ?? 0);
  }, [amount, fromCoin, rates]);

  const swapCoins = () => {
    setFromCoin(toCoin);
    setToCoin(fromCoin);
  };

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">Coin Converter</h3>
          <p className="text-sm text-muted">Live rates via CoinGecko, refreshed every 60 seconds.</p>
        </div>
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => void fetchRates(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        <label className="text-sm font-medium text-muted">
          From
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              min="0"
              step="any"
              value={Number.isNaN(amount) ? "" : amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            <select
              value={fromCoin}
              onChange={(event) => setFromCoin(event.target.value as CoinSymbol)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              {COINS.map((coin) => (
                <option key={coin.id} value={coin.symbol}>
                  {coin.symbol}
                </option>
              ))}
            </select>
          </div>
        </label>

        <div className="flex items-end justify-center">
          <button
            type="button"
            aria-label="Swap coins"
            onClick={swapCoins}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background text-muted transition hover:text-foreground"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        <label className="text-sm font-medium text-muted">
          To
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              readOnly
              value={convertedAmount === null ? "-" : formatNumber(convertedAmount)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
            />
            <select
              value={toCoin}
              onChange={(event) => setToCoin(event.target.value as CoinSymbol)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              {COINS.map((coin) => (
                <option key={coin.id} value={coin.symbol}>
                  {coin.symbol}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-background p-4 text-sm">
        {loading ? <p className="text-muted">Loading live rates...</p> : null}
        {error ? <p className="text-red-400">{error}</p> : null}
        {!loading && !error && convertedAmount !== null ? (
          <div className="space-y-1">
            <p>
              {formatNumber(amount)} {fromCoin} ={" "}
              <span className="font-semibold text-primary">
                {formatNumber(convertedAmount)} {toCoin}
              </span>
            </p>
            <p className="text-muted">Approx fiat value: ${formatNumber(fiatValue, 2)} USD</p>
          </div>
        ) : null}
        <p className="mt-2 text-xs text-muted">
          Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "-"}
        </p>
      </div>

      <div className="mt-4 text-xs text-muted">
        Pairs available: {COINS.map((coin) => coin.label).join(" | ")}
      </div>
    </section>
  );
}
