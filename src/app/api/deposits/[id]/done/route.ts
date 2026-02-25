import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import DepositHistory from "@/lib/models/deposit-history.model";
import TransactionNotification from "@/lib/models/transaction-notification.model";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const deposit = await DepositHistory.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { $set: { userMarkedDone: true, status: "PENDING" } },
    { new: true }
  ).lean<{
    amountUsd: number;
    method: "USDT_BEP20" | "USDT_TRC20" | "BTC";
  }>();

  if (!deposit) {
    return NextResponse.json({ ok: false, message: "Deposit not found" }, { status: 404 });
  }

  await TransactionNotification.create({
    userId: session.user.id,
    type: "deposit",
    message: `${deposit.method} deposit marked done and pending confirmation`,
    amount: deposit.amountUsd,
    status: "PENDING",
  });

  return NextResponse.json({
    ok: true,
    message: "Deposit marked as done. Pending confirmation.",
  });
}
