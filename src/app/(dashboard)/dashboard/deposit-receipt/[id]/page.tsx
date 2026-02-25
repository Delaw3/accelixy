import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { buttonStyles } from "@/components/ui/button";
import { connectDB } from "@/lib/db/mongoose";
import DepositHistory from "@/lib/models/deposit-history.model";

export const dynamic = "force-dynamic";

function formatDate(value: Date | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type Params = {
  params: Promise<{ id: string }>;
};

export default async function DepositReceiptPage({ params }: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    notFound();
  }

  const { id } = await params;
  await connectDB();

  const deposit = await DepositHistory.findOne({ _id: id, userId }).lean<{
    method: "USDT_BEP20" | "USDT_TRC20" | "BTC";
    amountUsd: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reference: string;
    address: string;
    userMarkedDone: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }>();

  if (!deposit) {
    notFound();
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-2xl font-semibold md:text-3xl">Deposit Receipt</h3>
      <p className="mt-2 text-sm text-muted">
        This receipt reflects the latest confirmation status for your deposit.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Transaction ID</p>
          <p className="mt-1 break-all text-sm font-semibold">{deposit.reference}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Status</p>
          <div className="mt-1">
            <StatusBadge status={deposit.status} />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Method</p>
          <p className="mt-1 text-sm font-semibold">{deposit.method}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Amount</p>
          <p className="mt-1 text-sm font-semibold">${deposit.amountUsd.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3 sm:col-span-2">
          <p className="text-xs text-muted">Payment Address</p>
          <p className="mt-1 break-all text-sm font-semibold">{deposit.address}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Marked Done</p>
          <p className="mt-1 text-sm font-semibold">{deposit.userMarkedDone ? "Yes" : "No"}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Last Updated</p>
          <p className="mt-1 text-sm font-semibold">{formatDate(deposit.updatedAt)}</p>
        </div>
      </div>

      <Link href="/dashboard" className={buttonStyles("gradient", "mt-5 inline-flex")}>
        Close
      </Link>
    </section>
  );
}
