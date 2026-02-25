import { auth } from "@/auth";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { connectDB } from "@/lib/db/mongoose";
import UserWalletAddress from "@/lib/models/user-wallet-address.model";
import Withdrawal from "@/lib/models/withdrawal.model";

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

export default async function WithdrawalHistoryPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let records: {
    id: string;
    amount: number;
    method: string;
    walletAddress: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt?: Date;
  }[] = [];

  if (userId) {
    await connectDB();
    const [rows, userWallets] = await Promise.all([
      Withdrawal.find({ userId })
        .sort({ createdAt: -1 })
        .lean<{
          _id: { toString: () => string };
          amount: number;
          method: string;
          walletAddress?: string;
          status: "PENDING" | "APPROVED" | "REJECTED";
          createdAt?: Date;
        }[]>(),
      UserWalletAddress.findOne({ userId }).lean<{
        bitcoinBTC?: string;
        usdtTRC20?: string;
        usdtBEP20?: string;
      }>(),
    ]);

    records = rows.map((item) => ({
      id: item._id.toString(),
      amount: item.amount,
      method: item.method,
      walletAddress:
        item.walletAddress?.trim() ||
        (item.method === "BTC"
          ? userWallets?.bitcoinBTC?.trim()
          : item.method === "USDT TRC20"
            ? userWallets?.usdtTRC20?.trim()
            : item.method === "USDT BEP20"
              ? userWallets?.usdtBEP20?.trim()
              : "") ||
        "Not available",
      status: item.status,
      createdAt: item.createdAt,
    }));
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-2xl font-semibold md:text-3xl">Withdrawal History</h3>

      {records.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No withdrawal requests yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Method</th>
                <th className="px-3 py-2">Wallet Address</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Requested</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{formatMoney(item.amount)}</td>
                  <td className="px-3 py-2">{item.method}</td>
                  <td className="px-3 py-2">{item.walletAddress}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-3 py-2">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
