import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Withdrawal from "@/lib/models/withdrawal.model";
import { requireAdminUser } from "@/lib/auth/guards";

export async function GET() {
  const adminCheck = await requireAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json(
      { ok: false, message: adminCheck.message },
      { status: adminCheck.status },
    );
  }

  await connectDB();

  const withdrawals = await Withdrawal.find({})
    .populate("userId", "firstname lastname email")
    .sort({ createdAt: -1 })
    .lean<
      {
        _id: { toString: () => string };
        amount: number;
        method: string;
        walletAddress: string;
        status: "PENDING" | "APPROVED" | "REJECTED";
        createdAt?: Date;
        userId?: {
          firstname?: string;
          lastname?: string;
          email?: string;
        };
      }[]
    >();

  return NextResponse.json({
    ok: true,
    data: withdrawals.map((item) => ({
      id: item._id.toString(),
      amount: item.amount,
      method: item.method,
      walletAddress: item.walletAddress,
      status: item.status,
      createdAt: item.createdAt,
      user: {
        firstname: item.userId?.firstname ?? "",
        lastname: item.userId?.lastname ?? "",
        email: item.userId?.email ?? "",
      },
    })),
  });
}
