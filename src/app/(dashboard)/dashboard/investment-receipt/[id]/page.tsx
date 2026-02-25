import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { buttonStyles } from "@/components/ui/button";
import { connectDB } from "@/lib/db/mongoose";
import Investment from "@/lib/models/investment.model";

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

export default async function InvestmentReceiptPage({ params }: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    notFound();
  }

  const { id } = await params;
  await connectDB();

  const investment = await Investment.findOne({
    _id: id,
    userId,
  }).lean<{
    planName: string;
    amount: number;
    roiPercent: number;
    expectedReturn: number;
    status: "ACTIVE" | "COMPLETED" | "CANCELLED";
    startedAt?: Date;
    endsAt?: Date;
    createdAt?: Date;
  }>();

  if (!investment) {
    notFound();
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-2xl font-semibold md:text-3xl">Investment Receipt</h3>
      <p className="mt-2 text-sm text-muted">
        Your investment has been recorded successfully.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Plan</p>
          <p className="mt-1 text-sm font-semibold">{investment.planName}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Status</p>
          <div className="mt-1">
            <StatusBadge status={investment.status} />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Amount Invested</p>
          <p className="mt-1 text-sm font-semibold">{formatMoney(investment.amount)}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">ROI Percent</p>
          <p className="mt-1 text-sm font-semibold">{investment.roiPercent}%</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Expected Return</p>
          <p className="mt-1 text-sm font-semibold">{formatMoney(investment.expectedReturn)}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Started</p>
          <p className="mt-1 text-sm font-semibold">{formatDate(investment.startedAt)}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3 sm:col-span-2">
          <p className="text-xs text-muted">Ends</p>
          <p className="mt-1 text-sm font-semibold">{formatDate(investment.endsAt)}</p>
        </div>
      </div>

      <Link href="/dashboard" className={buttonStyles("gradient", "mt-5 inline-flex")}>
        Close
      </Link>
    </section>
  );
}
