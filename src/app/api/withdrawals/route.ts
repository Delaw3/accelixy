import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActiveUser } from "@/lib/auth/guards";
import { delCache } from "@/lib/cache/cache";
import { cacheKeys } from "@/lib/cache/keys";
import { connectDB } from "@/lib/db/mongoose";
import {
  withdrawalRequestAdminTemplate,
  withdrawalRequestUserTemplate,
} from "@/lib/mail/admin-templates";
import { formatUsd, getAdminNotificationEmail, sendMailSafely } from "@/lib/mail/notify";
import TransactionNotification from "@/lib/models/transaction-notification.model";
import User from "@/lib/models/user.model";
import UserWalletAddress from "@/lib/models/user-wallet-address.model";
import UserWallet from "@/lib/models/user-wallet.model";
import Withdrawal from "@/lib/models/withdrawal.model";
import { capitalizeFirstLetter } from "@/lib/utils";

const createWithdrawalSchema = z.object({
  amountUsd: z.number().positive(),
  walletType: z.enum(["bitcoinBTC", "usdtTRC20", "usdtBEP20"]),
});

export async function POST(request: Request) {
  const active = await requireActiveUser();
  if (!active.ok) {
    return NextResponse.json({ ok: false, message: active.message }, { status: active.status });
  }
  const session = active.session;

  const body = await request.json();
  const parsed = createWithdrawalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid withdrawal payload", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();

  const [wallet, walletAddresses] = await Promise.all([
    UserWallet.findOne({ userId: session.user.id }).lean<{ balance?: number }>(),
    UserWalletAddress.findOne({ userId: session.user.id }).lean<{
      bitcoinBTC?: string;
      usdtTRC20?: string;
      usdtBEP20?: string;
    }>(),
  ]);

  const amountUsd = Number(parsed.data.amountUsd);
  const balance = wallet?.balance ?? 0;
  if (balance < amountUsd) {
    return NextResponse.json(
      {
        ok: false,
        message: "Insufficient balance for withdrawal.",
      },
      { status: 402 }
    );
  }

  const walletAddress = walletAddresses?.[parsed.data.walletType]?.trim();
  if (!walletAddress) {
    return NextResponse.json(
      {
        ok: false,
        message: "No wallet found. Go to your profile and add at least one wallet address.",
      },
      { status: 400 }
    );
  }

  const methodLabelMap = {
    bitcoinBTC: "BTC",
    usdtTRC20: "USDT TRC20",
    usdtBEP20: "USDT BEP20",
  } as const;

  const withdrawal = await Withdrawal.create({
    userId: session.user.id,
    amount: amountUsd,
    method: methodLabelMap[parsed.data.walletType],
    walletAddress,
    status: "PENDING",
  });

  await TransactionNotification.create({
    userId: session.user.id,
    type: "withdrawal",
    message: `${methodLabelMap[parsed.data.walletType]} withdrawal request submitted`,
    amount: amountUsd,
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
    const amount = formatUsd(amountUsd);
    const method = methodLabelMap[parsed.data.walletType];

    const userMail = withdrawalRequestUserTemplate({
      name,
      amount,
      method,
      walletAddress,
    });
    await sendMailSafely(
      {
        to: currentUser.email,
        subject: userMail.subject,
        html: userMail.html,
        text: userMail.text,
        attachments: userMail.attachments,
      },
      "withdrawal request user notice",
    );

    const adminEmail = getAdminNotificationEmail();
    if (adminEmail) {
      const adminMail = withdrawalRequestAdminTemplate({
        name,
        email: currentUser.email,
        amount,
        method,
        walletAddress,
      });
      await sendMailSafely(
        {
          to: adminEmail,
          subject: adminMail.subject,
          html: adminMail.html,
          text: adminMail.text,
          attachments: adminMail.attachments,
        },
        "withdrawal request admin notice",
      );
    }
  }

  await delCache([
    cacheKeys.adminWithdrawalsList,
    cacheKeys.adminUsersList,
  ]);

  return NextResponse.json(
    {
      ok: true,
      message: "Withdrawal request submitted",
      data: {
        id: withdrawal._id.toString(),
      },
    },
    { status: 201 }
  );
}
