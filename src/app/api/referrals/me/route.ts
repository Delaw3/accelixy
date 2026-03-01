import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import Referral from "@/lib/models/referral.model";
import User from "@/lib/models/user.model";
import { capitalizeFirstLetter } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const [currentUser, referredUsers, referralRows] = await Promise.all([
    User.findById(session.user.id)
      .select("referralCode")
      .lean<{ referralCode?: string } | null>(),
    User.find({ referredBy: session.user.id })
      .select("firstname lastname email referralRewardPaid createdAt")
      .sort({ createdAt: -1 })
      .lean<
        {
          _id: { toString: () => string };
          firstname: string;
          lastname: string;
          email: string;
          referralRewardPaid?: boolean;
          createdAt?: Date;
        }[]
      >(),
    Referral.find({ referrerId: session.user.id })
      .select("referredUserId rewardAmount rewardStatus")
      .lean<
        {
          referredUserId: { toString: () => string };
          rewardAmount?: number;
          rewardStatus?: "PENDING" | "PAID";
        }[]
      >(),
  ]);

  const rewardByReferredUserId = new Map(
    referralRows.map((row) => [
      row.referredUserId.toString(),
      {
        rewardAmount: row.rewardAmount ?? 0,
        rewardStatus: row.rewardStatus ?? "PENDING",
      },
    ])
  );

  return NextResponse.json({
    ok: true,
    data: {
      referralCode: currentUser?.referralCode ?? "",
      referredUsers: referredUsers.map((user) => ({
        id: user._id.toString(),
        firstname: capitalizeFirstLetter(user.firstname),
        lastname: capitalizeFirstLetter(user.lastname),
        email: user.email,
        referralRewardPaid: Boolean(user.referralRewardPaid),
        referralBonusPaid: rewardByReferredUserId.get(user._id.toString())?.rewardAmount ?? 0,
        createdAt: user.createdAt,
      })),
    },
  });
}
