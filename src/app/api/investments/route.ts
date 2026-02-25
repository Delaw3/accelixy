import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import { getInvestmentPlanByKey } from "@/lib/investment/plans";
import Investment from "@/lib/models/investment.model";
import TransactionNotification from "@/lib/models/transaction-notification.model";
import UserWallet from "@/lib/models/user-wallet.model";

const createInvestmentSchema = z.object({
  planKey: z.enum([
    "FIRST_PLAN",
    "SECOUND_PLAN",
    "COMPOUND_PLAN",
    "MINING_PLAN",
  ]),
  amountUsd: z.number().positive(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createInvestmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid investment payload", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const plan = getInvestmentPlanByKey(parsed.data.planKey);
  if (!plan) {
    return NextResponse.json({ ok: false, message: "Invalid plan selected" }, { status: 400 });
  }

  const amountUsd = Number(parsed.data.amountUsd);
  if (amountUsd < plan.minAmountUsd) {
    return NextResponse.json(
      { ok: false, message: `Minimum amount for ${plan.name} is $${plan.minAmountUsd}` },
      { status: 400 }
    );
  }
  if (plan.maxAmountUsd !== null && amountUsd > plan.maxAmountUsd) {
    return NextResponse.json(
      { ok: false, message: `Maximum amount for ${plan.name} is $${plan.maxAmountUsd}` },
      { status: 400 }
    );
  }

  await connectDB();

  const wallet = await UserWallet.findOne({ userId: session.user.id });
  if (!wallet || wallet.balance < amountUsd) {
    return NextResponse.json(
      {
        ok: false,
        message: "Insufficient balance. Please deposit funds.",
        redirectTo: "/dashboard/deposit",
      },
      { status: 402 }
    );
  }

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + plan.durationHours * 60 * 60 * 1000);
  const expectedReturn = Number((amountUsd + (amountUsd * plan.roiPercent) / 100).toFixed(2));

  wallet.balance = Number((wallet.balance - amountUsd).toFixed(2));
  await wallet.save();

  const investment = await Investment.create({
    userId: session.user.id,
    planName: plan.name,
    amount: amountUsd,
    roiPercent: plan.roiPercent,
    status: "ACTIVE",
    startedAt,
    endsAt,
    expectedReturn,
  });

  await TransactionNotification.create({
    userId: session.user.id,
    type: "investment",
    message: `${plan.name} investment created`,
    amount: amountUsd,
    status: "INFO",
  });

  return NextResponse.json(
    {
      ok: true,
      message: "Investment created successfully",
      data: {
        id: investment._id.toString(),
        planName: plan.name,
        amountUsd,
        roiPercent: plan.roiPercent,
        expectedReturn,
      },
    },
    { status: 201 }
  );
}
