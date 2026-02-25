import { auth } from "@/auth";
import { DepositHistoryTable } from "@/components/dashboard/DepositHistoryTable";
import { connectDB } from "@/lib/db/mongoose";
import DepositHistory from "@/lib/models/deposit-history.model";

export default async function DepositHistoryPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let deposits: {
    id: string;
    method: string;
    amountUsd: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reference: string;
    createdAt?: Date;
  }[] = [];

  if (userId) {
    await connectDB();
    const records = await DepositHistory.find({ userId })
      .sort({ createdAt: -1 })
      .lean<{
        _id: { toString: () => string };
        method: string;
        amountUsd: number;
        status: "PENDING" | "APPROVED" | "REJECTED";
        reference: string;
        createdAt?: Date;
      }[]>();

    deposits = records.map((item) => ({
      id: item._id.toString(),
      method: item.method,
      amountUsd: item.amountUsd,
      status: item.status,
      reference: item.reference,
      createdAt: item.createdAt,
    }));
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-2xl font-semibold md:text-3xl">Deposit History</h3>

      <DepositHistoryTable
        items={deposits.map((item) => ({
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
        }))}
      />
    </section>
  );
}
