import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import Investment from "@/lib/models/investment.model";

export async function GET() {
  const adminCheck = await requireAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json(
      { ok: false, message: adminCheck.message },
      { status: adminCheck.status },
    );
  }

  await connectDB();

  const investments = await Investment.find({})
    .populate("userId", "firstname lastname email")
    .sort({ createdAt: -1 })
    .lean<
      {
        _id: { toString: () => string };
        userId?: {
          firstname?: string;
          lastname?: string;
          email?: string;
        };
        planName: string;
        amount: number;
        roiPercent: number;
        expectedReturn: number;
        startedAt: Date;
        endsAt: Date;
        status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "PAID";
      }[]
    >();

  return NextResponse.json({
    ok: true,
    data: investments.map((item) => ({
      id: item._id.toString(),
      user: {
        firstname: item.userId?.firstname ?? "",
        lastname: item.userId?.lastname ?? "",
        email: item.userId?.email ?? "",
      },
      planName: item.planName,
      amount: item.amount,
      roiPercent: item.roiPercent,
      expectedReturn: item.expectedReturn,
      startedAt: item.startedAt,
      endsAt: item.endsAt,
      status: item.status,
    })),
  });
}
