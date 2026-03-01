import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getDepositMethodConfig, type DepositMethod } from "@/lib/deposit/payment-methods";
import { requireActiveUser } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import {
  depositRequestAdminTemplate,
  depositRequestUserTemplate,
} from "@/lib/mail/admin-templates";
import { formatUsd, getAdminNotificationEmail, sendMailSafely } from "@/lib/mail/notify";
import DepositHistory from "@/lib/models/deposit-history.model";
import TransactionNotification from "@/lib/models/transaction-notification.model";
import User from "@/lib/models/user.model";
import { capitalizeFirstLetter } from "@/lib/utils";

const createDepositSchema = z.object({
  method: z.enum(["USDT_BEP20", "USDT_TRC20", "BTC"]),
  amountUsd: z.number().min(1, "Amount must be at least $1"),
});

export async function POST(request: Request) {
  const active = await requireActiveUser();
  if (!active.ok) {
    return NextResponse.json({ ok: false, message: active.message }, { status: active.status });
  }
  const session = active.session;

  const body = await request.json();
  const parsed = createDepositSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid deposit payload", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();

  const methodConfig = getDepositMethodConfig(parsed.data.method as DepositMethod);
  if (!methodConfig) {
    return NextResponse.json({ ok: false, message: "Unsupported payment method" }, { status: 400 });
  }

  const reference = `${session.user.username ?? "ACC"}-${randomUUID().replace(/-/g, "").slice(0, 16)}`;

  const deposit = await DepositHistory.create({
    userId: session.user.id,
    method: parsed.data.method,
    amountUsd: parsed.data.amountUsd,
    address: methodConfig.address,
    qrCodeUrl: methodConfig.qrCodeUrl,
    status: "PENDING",
    reference,
    userMarkedDone: false,
  });

  await TransactionNotification.create({
    userId: session.user.id,
    type: "deposit",
    message: `${methodConfig.label} deposit created and awaiting payment`,
    amount: parsed.data.amountUsd,
    status: "PENDING",
  });

  const currentUser = await User.findById(session.user.id)
    .select("firstname lastname username email")
    .lean<{ firstname?: string; lastname?: string; username?: string; email?: string } | null>();

  if (currentUser?.email) {
    const name =
      `${capitalizeFirstLetter(currentUser.firstname)} ${capitalizeFirstLetter(currentUser.lastname)}`.trim() ||
      currentUser.username ||
      "Investor";
    const amount = formatUsd(parsed.data.amountUsd);

    const userMail = depositRequestUserTemplate({
      name,
      amount,
      method: methodConfig.label,
      reference,
    });
    await sendMailSafely(
      {
        to: currentUser.email,
        subject: userMail.subject,
        html: userMail.html,
        text: userMail.text,
        attachments: userMail.attachments,
      },
      "deposit request user notice",
    );

    const adminEmail = getAdminNotificationEmail();
    if (adminEmail) {
      const adminMail = depositRequestAdminTemplate({
        name,
        email: currentUser.email,
        amount,
        method: methodConfig.label,
        reference,
      });
      await sendMailSafely(
        {
          to: adminEmail,
          subject: adminMail.subject,
          html: adminMail.html,
          text: adminMail.text,
          attachments: adminMail.attachments,
        },
        "deposit request admin notice",
      );
    }
  }

  return NextResponse.json(
    {
      ok: true,
      message: "Deposit created",
      data: {
        id: deposit._id.toString(),
      },
    },
    { status: 201 }
  );
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const deposits = await DepositHistory.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean<{
      _id: { toString: () => string };
      method: DepositMethod;
      amountUsd: number;
      status: "PENDING" | "APPROVED" | "REJECTED";
      reference: string;
      createdAt?: Date;
    }[]>();

  return NextResponse.json({
    ok: true,
    data: deposits.map((item) => ({
      id: item._id.toString(),
      method: item.method,
      amountUsd: item.amountUsd,
      status: item.status,
      reference: item.reference,
      createdAt: item.createdAt,
    })),
  });
}
