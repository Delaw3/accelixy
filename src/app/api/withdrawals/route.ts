import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import TransactionNotification from "@/lib/models/transaction-notification.model";
import UserWalletAddress from "@/lib/models/user-wallet-address.model";
import UserWallet from "@/lib/models/user-wallet.model";
import Withdrawal from "@/lib/models/withdrawal.model";

const createWithdrawalSchema = z.object({
  amountUsd: z.number().positive(),
  walletType: z.enum(["bitcoinBTC", "usdtTRC20", "usdtBEP20"]),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

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
        message: "Selected wallet is not available. Add wallet first.",
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
