import { auth } from "@/auth";
import { InvestmentHistoryTable } from "@/components/dashboard/InvestmentHistoryTable";
import { connectDB } from "@/lib/db/mongoose";
import Investment from "@/lib/models/investment.model";

export const dynamic = "force-dynamic";

export default async function InvestmentHistoryPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let investments: {
    id: string;
    planName: string;
    amount: number;
    roiPercent: number;
    expectedReturn: number;
    status: "ACTIVE" | "COMPLETED" | "CANCELLED";
    startedAt?: Date;
    endsAt?: Date;
    createdAt?: Date;
  }[] = [];

  if (userId) {
    await connectDB();
    const records = await Investment.find({ userId })
      .sort({ createdAt: -1 })
      .lean<{
        _id: { toString: () => string };
        planName: string;
        amount: number;
        roiPercent: number;
        expectedReturn: number;
        status: "ACTIVE" | "COMPLETED" | "CANCELLED";
        startedAt?: Date;
        endsAt?: Date;
        createdAt?: Date;
      }[]>();

    investments = records.map((item) => ({
      id: item._id.toString(),
      planName: item.planName,
      amount: item.amount,
      roiPercent: item.roiPercent,
      expectedReturn: item.expectedReturn,
      status: item.status,
      startedAt: item.startedAt,
      endsAt: item.endsAt,
      createdAt: item.createdAt,
    }));
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-2xl font-semibold md:text-3xl">Investment History</h3>

      <InvestmentHistoryTable
        items={investments.map((item) => ({
          ...item,
          startedAt: item.startedAt ? new Date(item.startedAt).toISOString() : undefined,
          endsAt: item.endsAt ? new Date(item.endsAt).toISOString() : undefined,
          createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
        }))}
      />
    </section>
  );
}
