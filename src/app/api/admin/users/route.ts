import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdminUser } from "@/lib/auth/guards";
import { cacheKeys } from "@/lib/cache/keys";
import { withCache } from "@/lib/cache/withCache";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/user.model";
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

  const { data, cached } = await withCache(cacheKeys.adminUsersList, 30, async () => {
    const userRoleFilter = { $in: ["USER", "user", "client"] };

    const result = await User.aggregate<{
      users: {
        _id: Types.ObjectId;
        firstname?: string;
        lastname?: string;
        username?: string;
        email?: string;
        country?: string;
        createdAt?: Date;
        isActive?: boolean;
        walletBalance?: number;
        bitcoinBTC?: string;
        usdtTRC20?: string;
        usdtBEP20?: string;
      }[];
      stats: {
        totalUsers: number;
        pendingWithdrawals: number;
        activeInvestments: number;
      }[];
    }>([
      { $match: { role: userRoleFilter } },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          users: [
            {
              $lookup: {
                from: "userwallets",
                localField: "_id",
                foreignField: "userId",
                as: "wallet",
              },
            },
            {
              $lookup: {
                from: "userwalletaddresses",
                localField: "_id",
                foreignField: "userId",
                as: "walletAddress",
              },
            },
            {
              $project: {
                firstname: 1,
                lastname: 1,
                username: 1,
                email: 1,
                country: 1,
                createdAt: 1,
                isActive: 1,
                walletBalance: { $ifNull: [{ $first: "$wallet.balance" }, 0] },
                bitcoinBTC: { $ifNull: [{ $first: "$walletAddress.bitcoinBTC" }, ""] },
                usdtTRC20: { $ifNull: [{ $first: "$walletAddress.usdtTRC20" }, ""] },
                usdtBEP20: { $ifNull: [{ $first: "$walletAddress.usdtBEP20" }, ""] },
              },
            },
          ],
          stats: [
            {
              $group: {
                _id: null,
                totalUsers: { $sum: 1 },
              },
            },
            {
              $lookup: {
                from: "withdrawals",
                pipeline: [{ $match: { status: "PENDING" } }, { $count: "count" }],
                as: "pendingWithdrawalsCount",
              },
            },
            {
              $lookup: {
                from: "investments",
                pipeline: [{ $match: { status: "ACTIVE" } }, { $count: "count" }],
                as: "activeInvestmentsCount",
              },
            },
            {
              $project: {
                _id: 0,
                totalUsers: 1,
                pendingWithdrawals: {
                  $ifNull: [{ $first: "$pendingWithdrawalsCount.count" }, 0],
                },
                activeInvestments: {
                  $ifNull: [{ $first: "$activeInvestmentsCount.count" }, 0],
                },
              },
            },
          ],
        },
      },
    ]);

    const payload = result[0] ?? { users: [], stats: [] };
    const stats = payload.stats[0] ?? {
      totalUsers: 0,
      pendingWithdrawals: 0,
      activeInvestments: 0,
    };

    return {
      stats,
      users: payload.users.map((user) => ({
        id: user._id.toString(),
        firstname: capitalizeFirstLetter(user.firstname),
        lastname: capitalizeFirstLetter(user.lastname),
        username: user.username ?? "",
        email: user.email ?? "",
        country: user.country ?? "",
        createdAt: user.createdAt,
        isActive: user.isActive !== false,
        walletBalance: user.walletBalance ?? 0,
        bitcoinBTC: user.bitcoinBTC ?? "",
        usdtTRC20: user.usdtTRC20 ?? "",
        usdtBEP20: user.usdtBEP20 ?? "",
      })),
    };
  });

  return NextResponse.json({
    ok: true,
    data,
    cached,
  });
}
