import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/guards";
import { cacheKeys } from "@/lib/cache/keys";
import { withCache } from "@/lib/cache/withCache";
import { connectDB } from "@/lib/db/mongoose";
import UserWallet from "@/lib/models/user-wallet.model";

export async function GET() {
  const active = await requireActiveUser();
  if (!active.ok) {
    return NextResponse.json({ ok: false, message: active.message }, { status: active.status });
  }

  const userId = active.session.user.id;
  await connectDB();

  const { data, cached } = await withCache(cacheKeys.userSummary(userId), 15, async () => {
    const objectId = new Types.ObjectId(userId);

    const result = await UserWallet.aggregate<{
      walletBalance?: number;
      currentInvestment?: number;
      totalEarnings?: number;
      totalWithdrawals?: number;
    }>([
      { $match: { userId: objectId } },
      {
        $lookup: {
          from: "investments",
          let: { uid: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$userId", "$$uid"] } } },
            {
              $group: {
                _id: null,
                currentInvestment: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "ACTIVE"] }, "$amount", 0],
                  },
                },
                totalEarnings: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", "PAID"] },
                      {
                        $subtract: [
                          {
                            $ifNull: [
                              "$expectedReturn",
                              {
                                $add: ["$amount", { $divide: [{ $multiply: ["$amount", "$roiPercent"] }, 100] }],
                              },
                            ],
                          },
                          "$amount",
                        ],
                      },
                      0,
                    ],
                  },
                },
              },
            },
          ],
          as: "investmentTotals",
        },
      },
      {
        $lookup: {
          from: "withdrawals",
          let: { uid: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$userId", "$$uid"] }, { $eq: ["$status", "APPROVED"] }],
                },
              },
            },
            { $group: { _id: null, totalWithdrawals: { $sum: "$amount" } } },
          ],
          as: "withdrawalTotals",
        },
      },
      {
        $project: {
          _id: 0,
          walletBalance: { $ifNull: ["$balance", 0] },
          currentInvestment: { $ifNull: [{ $first: "$investmentTotals.currentInvestment" }, 0] },
          totalEarnings: { $ifNull: [{ $first: "$investmentTotals.totalEarnings" }, 0] },
          totalWithdrawals: { $ifNull: [{ $first: "$withdrawalTotals.totalWithdrawals" }, 0] },
        },
      },
    ]);

    return (
      result[0] ?? {
        walletBalance: 0,
        currentInvestment: 0,
        totalEarnings: 0,
        totalWithdrawals: 0,
      }
    );
  });

  return NextResponse.json({
    ok: true,
    data,
    cached,
  });
}
