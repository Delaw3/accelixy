import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { normalizeRole } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import DepositHistory from "@/lib/models/deposit-history.model";
import Referral from "@/lib/models/referral.model";
import TransactionNotification from "@/lib/models/transaction-notification.model";
import User from "@/lib/models/user.model";
import UserWallet from "@/lib/models/user-wallet.model";

type Params = {
  params: Promise<{ id: string }>;
};

const REFERRAL_RATE = 0.06;

export async function PATCH(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (normalizeRole(session.user.role) !== "ADMIN") {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const { id } = await params;
  const dbSession = await mongoose.startSession();

  try {
    let result: {
      depositId: string;
      creditedAmount: number;
      referralRewardAmount: number;
      referralRewarded: boolean;
    } | null = null;

    await dbSession.withTransaction(async () => {
      const deposit = await DepositHistory.findOne({
        _id: id,
      }).session(dbSession);

      if (!deposit) {
        throw new Error("DEPOSIT_NOT_FOUND");
      }

      if (deposit.status === "APPROVED") {
        result = {
          depositId: deposit._id.toString(),
          creditedAmount: deposit.amountUsd,
          referralRewardAmount: 0,
          referralRewarded: false,
        };
        return;
      }

      deposit.status = "APPROVED";
      await deposit.save({ session: dbSession });

      const userWallet = await UserWallet.findOneAndUpdate(
        { userId: deposit.userId },
        { $inc: { balance: deposit.amountUsd } },
        { new: true, session: dbSession }
      );

      if (!userWallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      await TransactionNotification.create(
        [
          {
            userId: deposit.userId,
            type: "deposit",
            message: `${deposit.method} deposit approved and credited`,
            amount: deposit.amountUsd,
            status: "APPROVED",
          },
        ],
        { session: dbSession }
      );

      let referralRewardAmount = 0;
      let referralRewarded = false;

      const referredUser = await User.findById(deposit.userId)
        .select("referredBy referralRewardPaid")
        .session(dbSession);

      if (referredUser?.referredBy && !referredUser.referralRewardPaid) {
        const updateResult = await User.updateOne(
          {
            _id: deposit.userId,
            referralRewardPaid: { $ne: true },
            referredBy: { $ne: null },
          },
          {
            $set: {
              referralRewardPaid: true,
              referralFirstDepositRewardedAt: new Date(),
            },
          },
          { session: dbSession }
        );

        if (updateResult.modifiedCount === 1) {
          referralRewardAmount = Number((deposit.amountUsd * REFERRAL_RATE).toFixed(2));

          await UserWallet.findOneAndUpdate(
            { userId: referredUser.referredBy },
            { $inc: { balance: referralRewardAmount } },
            { session: dbSession }
          );

          await Referral.findOneAndUpdate(
            { referredUserId: deposit.userId },
            {
              $set: {
                firstDepositAmount: deposit.amountUsd,
                rewardAmount: referralRewardAmount,
                rewardStatus: "PAID",
                rewardedAt: new Date(),
              },
            },
            { session: dbSession }
          );

          await TransactionNotification.create(
            [
              {
                userId: referredUser.referredBy,
                type: "deposit",
                message: `Referral bonus credited from first deposit`,
                amount: referralRewardAmount,
                status: "APPROVED",
              },
            ],
            { session: dbSession }
          );

          referralRewarded = true;
        }
      }

      result = {
        depositId: deposit._id.toString(),
        creditedAmount: deposit.amountUsd,
        referralRewardAmount,
        referralRewarded,
      };
    });

    if (!result) {
      throw new Error("APPROVAL_FAILED");
    }

    return NextResponse.json({
      ok: true,
      message: "Deposit approved successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "DEPOSIT_NOT_FOUND") {
      return NextResponse.json({ ok: false, message: "Deposit not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "WALLET_NOT_FOUND") {
      return NextResponse.json({ ok: false, message: "User wallet not found" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "Unable to approve deposit" }, { status: 500 });
  } finally {
    await dbSession.endSession();
  }
}
