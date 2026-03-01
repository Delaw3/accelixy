import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdminUser } from "@/lib/auth/guards";
import { cacheKeys } from "@/lib/cache/keys";
import { withCache } from "@/lib/cache/withCache";
import { connectDB } from "@/lib/db/mongoose";
import Investment from "@/lib/models/investment.model";
import { capitalizeFirstLetter } from "@/lib/utils";

export async function GET() {
  const adminCheck = await requireAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json(
      { ok: false, message: adminCheck.message },
      { status: adminCheck.status },
    );
  }

  await connectDB();

  const { data, cached } = await withCache(cacheKeys.adminInvestmentsList, 10, async () => {
    const investments = await Investment.aggregate<{
      _id: Types.ObjectId;
      user?: {
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
    }>([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [{ $project: { firstname: 1, lastname: 1, email: 1 } }],
          as: "user",
        },
      },
      {
        $project: {
          planName: 1,
          amount: 1,
          roiPercent: 1,
          expectedReturn: 1,
          startedAt: 1,
          endsAt: 1,
          status: 1,
          user: { $first: "$user" },
        },
      },
    ]);

    return investments.map((item) => ({
      id: item._id.toString(),
      user: {
        firstname: capitalizeFirstLetter(item.user?.firstname),
        lastname: capitalizeFirstLetter(item.user?.lastname),
        email: item.user?.email ?? "",
      },
      planName: item.planName,
      amount: item.amount,
      roiPercent: item.roiPercent,
      expectedReturn: item.expectedReturn,
      startedAt: item.startedAt,
      endsAt: item.endsAt,
      status: item.status,
    }));
  });

  return NextResponse.json({
    ok: true,
    data,
    cached,
  });
}
