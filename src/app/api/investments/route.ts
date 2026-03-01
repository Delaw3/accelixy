import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActiveUser } from "@/lib/auth/guards";
import { delCache } from "@/lib/cache/cache";
import { cacheKeys } from "@/lib/cache/keys";
import { connectDB } from "@/lib/db/mongoose";
import { getInvestmentPlanByKey } from "@/lib/investment/plans";
import {
  investmentCreatedAdminTemplate,
  investmentCreatedUserTemplate,
} from "@/lib/mail/admin-templates";
import { formatDateTime, formatUsd, getAdminNotificationEmail, sendMailSafely } from "@/lib/mail/notify";
import Investment from "@/lib/models/investment.model";
import TransactionNotification from "@/lib/models/transaction-notification.model";
import User from "@/lib/models/user.model";
import UserWallet from "@/lib/models/user-wallet.model";
import { capitalizeFirstLetter } from "@/lib/utils";

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
  const active = await requireActiveUser();
  if (!active.ok) {
    return NextResponse.json({ ok: false, message: active.message }, { status: active.status });
  }
  const session = active.session;

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

  const currentUser = await User.findById(session.user.id)
    .select("firstname lastname username email")
    .lean<{ firstname?: string; lastname?: string; username?: string; email?: string } | null>();

  if (currentUser?.email) {
    const name =
      `${capitalizeFirstLetter(currentUser.firstname)} ${capitalizeFirstLetter(currentUser.lastname)}`.trim() ||
      currentUser.username ||
      "Investor";
    const amount = formatUsd(amountUsd);
    const expectedReturnAmount = formatUsd(expectedReturn);
    const endDate = formatDateTime(endsAt);

    const userMail = investmentCreatedUserTemplate({
      name,
      amount,
      plan: plan.name,
      expectedReturn: expectedReturnAmount,
      endDate,
    });
    await sendMailSafely(
      {
        to: currentUser.email,
        subject: userMail.subject,
        html: userMail.html,
        text: userMail.text,
        attachments: userMail.attachments,
      },
      "investment created user notice",
    );

    const adminEmail = getAdminNotificationEmail();
    if (adminEmail) {
      const adminMail = investmentCreatedAdminTemplate({
        name,
        email: currentUser.email,
        amount,
        plan: plan.name,
        expectedReturn: expectedReturnAmount,
        endDate,
      });
      await sendMailSafely(
        {
          to: adminEmail,
          subject: adminMail.subject,
          html: adminMail.html,
          text: adminMail.text,
          attachments: adminMail.attachments,
        },
        "investment created admin notice",
      );
    }
  }

  await delCache([
    cacheKeys.adminInvestmentsList,
    cacheKeys.adminUsersList,
    cacheKeys.userSummary(session.user.id),
  ]);

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
