export const COINS = [
  { id: "bitcoin", symbol: "BTC", label: "Bitcoin (BTC)" },
  { id: "ethereum", symbol: "ETH", label: "Ethereum (ETH)" },
  { id: "tether", symbol: "USDT", label: "Tether (USDT)" },
  { id: "solana", symbol: "SOL", label: "Solana (SOL)" },
  { id: "ripple", symbol: "XRP", label: "XRP (XRP)" },
  { id: "binancecoin", symbol: "BNB", label: "BNB (BNB)" },
] as const;

export type CoinOption = (typeof COINS)[number];
export type CoinSymbol = CoinOption["symbol"];
export type CoinId = CoinOption["id"];

export const COIN_IDS_PARAM = COINS.map((coin) => coin.id).join(",");

export const COIN_BY_SYMBOL = COINS.reduce<Record<CoinSymbol, CoinOption>>(
  (acc, coin) => {
    acc[coin.symbol] = coin;
    return acc;
  },
  {} as Record<CoinSymbol, CoinOption>
);
