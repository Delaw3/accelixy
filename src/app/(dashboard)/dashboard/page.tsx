import { CircleDollarSign, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { auth } from "@/auth";
import { AssetCard } from "@/components/dashboard/AssetCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { TransactionNotifications } from "@/components/dashboard/TransactionNotifications";
import { WalletReminder } from "@/components/dashboard/WalletReminder";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/user.model";

const walletStat = { label: "Wallet Balance", value: "$0.00", icon: Wallet };

const compactStats = [
  { label: "Current Investment", value: "$0", icon: PiggyBank },
  { label: "Total Earnings", value: "$0", icon: TrendingUp },
  { label: "Total Withdrawals", value: "$0", icon: CircleDollarSign },
];

const assets = [
  { name: "Ripple", symbol: "XRP", value: "$0", change: "-2.37%" },
  { name: "Stellar", symbol: "XLM", value: "$0", change: "-2.00%" },
  { name: "Ethereum", symbol: "ETH", value: "$0", change: "-4.77%" },
  { name: "Bitcoin", symbol: "BTC", value: "$0", change: "-4.54%" },
  { name: "Dogecoin", symbol: "DOGE", value: "$0", change: "-2.40%" },
];

const transactionNotifications = [
  {
    id: "TXN-1001",
    type: "deposit" as const,
    message: "Deposit received into wallet",
    amount: "+$350.00",
    time: "2 mins ago",
  },
  {
    id: "TXN-1002",
    type: "investment" as const,
    message: "New plan investment created",
    amount: "$1,200.00",
    time: "14 mins ago",
  },
  {
    id: "TXN-1003",
    type: "withdrawal" as const,
    message: "Withdrawal request submitted",
    amount: "-$500.00",
    time: "1 hour ago",
  },
];

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let firstname = session?.user?.firstname ?? "User";
  let wallets = {
    bitcoinBTC: "",
    usdtTRC20: "",
    usdtBEP20: "",
  };

  if (userId) {
    await connectDB();
    const user = await User.findById(userId)
      .select("firstname wallets")
      .lean<{
        firstname?: string;
        wallets?: {
          bitcoinBTC?: string;
          usdtTRC20?: string;
          usdtBEP20?: string;
        };
      }>();

    firstname = user?.firstname ?? firstname;
    wallets = {
      bitcoinBTC: user?.wallets?.bitcoinBTC ?? "",
      usdtTRC20: user?.wallets?.usdtTRC20 ?? "",
      usdtBEP20: user?.wallets?.usdtBEP20 ?? "",
    };
  }

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

      <TransactionNotifications items={transactionNotifications} />

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Market / Assets</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => (
            <AssetCard
              key={asset.symbol}
              name={asset.name}
              symbol={asset.symbol}
              value={asset.value}
              change={asset.change}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
