import { CircleDollarSign, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { auth } from "@/auth";
import { StatCard } from "@/components/dashboard/StatCard";
import { TransactionNotifications } from "@/components/dashboard/TransactionNotifications";
import { WalletReminder } from "@/components/dashboard/WalletReminder";
import { CoinConverter } from "@/components/market/CoinConverter";
import { TradingViewTickerTape } from "@/components/market/TradingViewTickerTape";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/user.model";
import TransactionNotification from "@/lib/models/transaction-notification.model";
import UserWalletAddress from "@/lib/models/user-wallet-address.model";
import UserWallet from "@/lib/models/user-wallet.model";
import UserStats from "@/lib/models/user-stats.model";
import { getDashboardFinancialStats } from "@/lib/services/dashboard";

const paymentTickerSymbols = [
  { proName: "COINBASE:BTCUSD", title: "BTC/USD" },
  { proName: "BINANCE:BTCUSDT", title: "BTC/USDT" },
  { proName: "CRYPTOCAP:USDT", title: "USDT" },
];

function formatMoney(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatRelativeTime(value: Date | undefined) {
  if (!value) {
    return "Just now";
  }

  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) {
    return "Just now";
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} mins ago`;
  }
  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)} hours ago`;
  }
  return `${Math.floor(seconds / 86400)} days ago`;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let firstname = session?.user?.firstname ?? "User";
  let wallets = {
    bitcoinBTC: "",
    usdtTRC20: "",
    usdtBEP20: "",
  };
  let walletBalance = 0;
  let walletCurrency = "USD";
  let totalEarnings = 0;
  let currentInvestment = 0;
  let totalWithdrawals = 0;
  let transactionNotifications: {
    id: string;
    type: "deposit" | "withdrawal" | "investment";
    message: string;
    amount: string;
    time: string;
  }[] = [];

  if (userId) {
    await connectDB();
    const [user, walletAddress, wallet, stats, computed, notifications] = await Promise.all([
      User.findById(userId)
        .select("firstname")
        .lean<{ firstname?: string }>(),
      UserWalletAddress.findOne({ userId }).lean<{
        bitcoinBTC?: string;
        usdtTRC20?: string;
        usdtBEP20?: string;
      }>(),
      UserWallet.findOne({ userId }).lean<{ balance?: number; currency?: "USD" }>(),
      UserStats.findOne({ userId }).lean<{
        totalEarnings?: number;
      }>(),
      getDashboardFinancialStats(userId),
      TransactionNotification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean<{
          _id: { toString: () => string };
          type: "deposit" | "withdrawal" | "investment";
          message: string;
          amount: number;
          createdAt?: Date;
        }[]>(),
    ]);

    firstname = user?.firstname ?? firstname;
    wallets = {
      bitcoinBTC: walletAddress?.bitcoinBTC ?? "",
      usdtTRC20: walletAddress?.usdtTRC20 ?? "",
      usdtBEP20: walletAddress?.usdtBEP20 ?? "",
    };
    walletBalance = wallet?.balance ?? 0;
    walletCurrency = wallet?.currency ?? "USD";
    totalEarnings = stats?.totalEarnings ?? 0;
    currentInvestment = computed.currentInvestment;
    totalWithdrawals = computed.totalWithdrawals;
    transactionNotifications = notifications.map((item) => ({
      id: item._id.toString(),
      type: item.type,
      message: item.message,
      amount: formatMoney(item.amount, walletCurrency),
      time: formatRelativeTime(item.createdAt),
    }));
  }

  const walletStat = {
    label: "Wallet Balance",
    value: formatMoney(walletBalance, walletCurrency),
    icon: Wallet,
  };

  const compactStats = [
    {
      label: "Current Investment",
      value: formatMoney(currentInvestment, walletCurrency),
      icon: PiggyBank,
    },
    {
      label: "Total Earnings",
      value: formatMoney(totalEarnings, walletCurrency),
      icon: TrendingUp,
    },
    {
      label: "Total Withdrawals",
      value: formatMoney(totalWithdrawals, walletCurrency),
      icon: CircleDollarSign,
    },
  ];

  const hasAtLeastOneWallet = Boolean(
    wallets.bitcoinBTC || wallets.usdtTRC20 || wallets.usdtBEP20,
  );
  const displayFirstname = firstname.charAt(0).toUpperCase() + firstname.slice(1);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold md:text-3xl">
        Greetings, {displayFirstname}
      </h3>

      <WalletReminder
        initialHasWallet={hasAtLeastOneWallet}
        initialWallets={wallets}
      />

      <section className="hidden gap-4 sm:grid-cols-2 xl:grid-cols-4 md:grid">
        <StatCard
          key={walletStat.label}
          icon={walletStat.icon}
          label={walletStat.label}
          value={walletStat.value}
        />
        {compactStats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </section>

      <section className="space-y-3 md:hidden">
        <StatCard
          icon={walletStat.icon}
          label={walletStat.label}
          value={walletStat.value}
        />
        <div className="grid grid-cols-3 gap-2">
          {compactStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} className="rounded-lg border border-border bg-card p-2.5">
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-background text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-2 text-base font-semibold leading-tight">{stat.value}</p>
                <p className="mt-1 text-[11px] leading-tight text-muted">{stat.label}</p>
              </article>
            );
          })}
        </div>
      </section>

      {transactionNotifications.length > 0 ? (
        <TransactionNotifications
          items={transactionNotifications.slice(0, 6)}
          viewAllHref="/dashboard/transaction-notifications"
          showClearButton
        />
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Coin Converter</h2>
          <p className="text-sm text-muted">Convert payment coins using live market rates.</p>
        </div>
        <CoinConverter />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Payment Coins</h2>
        <TradingViewTickerTape symbols={paymentTickerSymbols} />
      </section>
    </div>
  );
}
