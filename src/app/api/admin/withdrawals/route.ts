import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdminUser } from "@/lib/auth/guards";
import { cacheKeys } from "@/lib/cache/keys";
import { withCache } from "@/lib/cache/withCache";
import { connectDB } from "@/lib/db/mongoose";
import Withdrawal from "@/lib/models/withdrawal.model";
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

  const { data, cached } = await withCache(cacheKeys.adminWithdrawalsList, 15, async () => {
    const withdrawals = await Withdrawal.aggregate<{
      _id: Types.ObjectId;
      amount: number;
      method: string;
      walletAddress: string;
      status: "PENDING" | "APPROVED" | "REJECTED";
      createdAt?: Date;
      user?: {
        firstname?: string;
        lastname?: string;
        email?: string;
      };
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
          amount: 1,
          method: 1,
          walletAddress: 1,
          status: 1,
          createdAt: 1,
          user: { $first: "$user" },
        },
      },
    ]);

    return withdrawals.map((item) => ({
      id: item._id.toString(),
      amount: item.amount,
      method: item.method,
      walletAddress: item.walletAddress,
      status: item.status,
      createdAt: item.createdAt,
      user: {
        firstname: capitalizeFirstLetter(item.user?.firstname),
        lastname: capitalizeFirstLetter(item.user?.lastname),
        email: item.user?.email ?? "",
      },
    }));
  });

  return NextResponse.json({
    ok: true,
    data,
    cached,
  });
}
