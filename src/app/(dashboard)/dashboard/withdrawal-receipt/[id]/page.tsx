import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { buttonStyles } from "@/components/ui/button";
import { connectDB } from "@/lib/db/mongoose";
import UserWalletAddress from "@/lib/models/user-wallet-address.model";
import Withdrawal from "@/lib/models/withdrawal.model";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: Date | undefined) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function WithdrawalReceiptPage({ params }: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    notFound();
  }

  const { id } = await params;
  await connectDB();

  const [withdrawal, userWallets] = await Promise.all([
    Withdrawal.findOne({
      _id: id,
      userId,
    }).lean<{
      amount: number;
      method: string;
      walletAddress?: string;
      status: "PENDING" | "APPROVED" | "REJECTED";
      createdAt?: Date;
      updatedAt?: Date;
    }>(),
    UserWalletAddress.findOne({ userId }).lean<{
      bitcoinBTC?: string;
      usdtTRC20?: string;
      usdtBEP20?: string;
    }>(),
  ]);

  if (!withdrawal) {
    notFound();
  }

  const walletAddress =
    withdrawal.walletAddress?.trim() ||
    (withdrawal.method === "BTC"
      ? userWallets?.bitcoinBTC?.trim()
      : withdrawal.method === "USDT TRC20"
        ? userWallets?.usdtTRC20?.trim()
        : withdrawal.method === "USDT BEP20"
          ? userWallets?.usdtBEP20?.trim()
          : "") ||
    "Not available";

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-2xl font-semibold md:text-3xl">Withdrawal Receipt</h3>
      <p className="mt-2 text-sm text-muted">
        Your withdrawal request is waiting for approval.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Amount</p>
          <p className="mt-1 text-sm font-semibold">{formatMoney(withdrawal.amount)}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Status</p>
          <div className="mt-1">
            <StatusBadge status={withdrawal.status} />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Method</p>
          <p className="mt-1 text-sm font-semibold">{withdrawal.method}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Requested At</p>
          <p className="mt-1 text-sm font-semibold">{formatDate(withdrawal.createdAt)}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3 sm:col-span-2">
          <p className="text-xs text-muted">Wallet Address</p>
          <p className="mt-1 break-all text-sm font-semibold">{walletAddress}</p>
        </div>
      </div>

      <Link href="/dashboard" className={buttonStyles("gradient", "mt-5 inline-flex")}>
        Close
      </Link>
    </section>
  );
}
