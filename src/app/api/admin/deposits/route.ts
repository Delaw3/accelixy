import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import DepositHistory from "@/lib/models/deposit-history.model";
import UserWallet from "@/lib/models/user-wallet.model";

export async function GET() {
  const adminCheck = await requireAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json(
      { ok: false, message: adminCheck.message },
      { status: adminCheck.status },
    );
  }

  await connectDB();

  const deposits = await DepositHistory.find({ userMarkedDone: true })
    .populate("userId", "username email")
    .sort({ createdAt: -1 })
    .lean<
      {
        _id: { toString: () => string };
        userId?: {
          _id?: { toString: () => string };
          username?: string;
          email?: string;
        };
        amountUsd: number;
        method: "USDT_BEP20" | "USDT_TRC20" | "BTC";
        status: "PENDING" | "APPROVED" | "REJECTED";
        reference: string;
        createdAt?: Date;
      }[]
    >();

  const userIds = deposits
    .map((item) => item.userId?._id?.toString())
    .filter((id): id is string => Boolean(id));

  const wallets = await UserWallet.find({ userId: { $in: userIds } })
    .select("userId balance")
    .lean<{ userId: { toString: () => string }; balance: number }[]>();

  const walletMap = new Map(wallets.map((item) => [item.userId.toString(), item.balance]));

  return NextResponse.json({
    ok: true,
    data: deposits.map((item) => {
      const userId = item.userId?._id?.toString() ?? "";
      return {
        id: item._id.toString(),
        username: item.userId?.username ?? "-",
        email: item.userId?.email ?? "-",
        amountUsd: item.amountUsd,
        paymentType: item.method,
        walletBalance: walletMap.get(userId) ?? 0,
        dateOfDeposit: item.createdAt,
        transactionStatus: item.status,
        transactionId: item.reference,
      };
    }),
  });
}
