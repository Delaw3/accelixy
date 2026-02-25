import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import DepositHistory from "@/lib/models/deposit-history.model";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const deposit = await DepositHistory.findOne({ _id: id, userId: session.user.id }).lean<{
    _id: { toString: () => string };
    method: "USDT_BEP20" | "USDT_TRC20" | "BTC";
    amountUsd: number;
    address: string;
    qrCodeUrl: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reference: string;
    userMarkedDone: boolean;
    createdAt?: Date;
  }>();

  if (!deposit) {
    return NextResponse.json({ ok: false, message: "Deposit not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    data: {
      id: deposit._id.toString(),
      method: deposit.method,
      amountUsd: deposit.amountUsd,
      address: deposit.address,
      qrCodeUrl: deposit.qrCodeUrl,
      status: deposit.status,
      reference: deposit.reference,
      userMarkedDone: deposit.userMarkedDone,
      createdAt: deposit.createdAt,
    },
  });
}
