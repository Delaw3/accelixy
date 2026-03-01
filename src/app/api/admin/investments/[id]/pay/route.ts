import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/guards";
import { delCache } from "@/lib/cache/cache";
import { cacheKeys } from "@/lib/cache/keys";
import { connectDB } from "@/lib/db/mongoose";
import { investmentPaidTemplate } from "@/lib/mail/admin-templates";
import { formatUsd, sendMailSafely } from "@/lib/mail/notify";
import Investment from "@/lib/models/investment.model";
import TransactionNotification from "@/lib/models/transaction-notification.model";
import User from "@/lib/models/user.model";
import UserWallet from "@/lib/models/user-wallet.model";
import { capitalizeFirstLetter } from "@/lib/utils";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: Params) {
  const adminCheck = await requireAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json(
      { ok: false, message: adminCheck.message },
      { status: adminCheck.status },
    );
  }

  await connectDB();
  const { id } = await params;
  const now = new Date();
  const dbSession = await mongoose.startSession();

  try {
    let result:
      | {
          id: string;
          payoutAmount: number;
          status: "PAID";
        }
      | null = null;
    let payoutMailPayload:
      | {
          to: string;
          name: string;
          amount: string;
          plan: string;
        }
      | null = null;
    let affectedUserId: string | null = null;

    await dbSession.withTransaction(async () => {
      const investment = await Investment.findOneAndUpdate(
        {
          _id: id,
          endsAt: { $lte: now },
          status: { $in: ["ACTIVE", "COMPLETED"] },
        },
        {
          $set: { status: "PAID" },
        },
        { new: true, session: dbSession },
      );

      if (!investment) {
        throw new Error("NOT_PAYABLE");
      }

      const payoutAmount =
        typeof investment.expectedReturn === "number" && investment.expectedReturn > 0
          ? Number(investment.expectedReturn.toFixed(2))
          : Number((investment.amount + (investment.amount * investment.roiPercent) / 100).toFixed(2));

      const wallet = await UserWallet.findOneAndUpdate(
        { userId: investment.userId },
        { $inc: { balance: payoutAmount } },
        { new: true, session: dbSession },
      );

      if (!wallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      await TransactionNotification.create(
        [
          {
            userId: investment.userId,
            type: "investment",
            message: `${investment.planName} investment payout credited`,
            amount: payoutAmount,
            status: "APPROVED",
          },
        ],
        { session: dbSession },
      );

      const user = await User.findById(investment.userId)
        .select("firstname lastname username email")
        .session(dbSession)
        .lean<{ firstname?: string; lastname?: string; username?: string; email?: string } | null>();

      if (user?.email) {
        const displayName =
          `${capitalizeFirstLetter(user.firstname)} ${capitalizeFirstLetter(user.lastname)}`.trim() ||
          user.username ||
          "Investor";
        payoutMailPayload = {
          to: user.email,
          name: displayName,
          amount: formatUsd(payoutAmount),
          plan: investment.planName,
        };
      }

      result = {
        id: investment._id.toString(),
        payoutAmount,
        status: "PAID",
      };
      affectedUserId = investment.userId.toString();
    });

    if (!result) {
      throw new Error("PAYMENT_FAILED");
    }

    if (payoutMailPayload) {
      const payoutMail = investmentPaidTemplate({
        name: payoutMailPayload.name,
        amount: payoutMailPayload.amount,
        plan: payoutMailPayload.plan,
      });
      await sendMailSafely(
        {
          to: payoutMailPayload.to,
          subject: payoutMail.subject,
          html: payoutMail.html,
          text: payoutMail.text,
          attachments: payoutMail.attachments,
        },
        "investment payout user notice",
      );
    }

    if (affectedUserId) {
      await delCache([
        cacheKeys.adminInvestmentsList,
        cacheKeys.adminUsersList,
        cacheKeys.userSummary(affectedUserId),
      ]);
    }

    return NextResponse.json({
      ok: true,
      message: "Investment payout completed",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_PAYABLE") {
      return NextResponse.json(
        { ok: false, message: "Investment cannot be paid yet or was already paid." },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message === "WALLET_NOT_FOUND") {
      return NextResponse.json({ ok: false, message: "User wallet not found." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "Unable to process payout." }, { status: 500 });
  } finally {
    await dbSession.endSession();
  }
}
