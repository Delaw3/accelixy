import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import UserWalletAddress from "@/lib/models/user-wallet-address.model";

const walletPayloadSchema = z.object({
  bitcoinBTC: z.string().max(200).optional(),
  usdtTRC20: z.string().max(200).optional(),
  usdtBEP20: z.string().max(200).optional(),
});

function normalizeWalletValue(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parsed = walletPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid wallet payload" },
      { status: 400 },
    );
  }

  const wallets = {
    bitcoinBTC: normalizeWalletValue(parsed.data.bitcoinBTC),
    usdtTRC20: normalizeWalletValue(parsed.data.usdtTRC20),
    usdtBEP20: normalizeWalletValue(parsed.data.usdtBEP20),
  };

  const hasAtLeastOneWallet = Boolean(
    wallets.bitcoinBTC || wallets.usdtTRC20 || wallets.usdtBEP20,
  );

  if (!hasAtLeastOneWallet) {
    return NextResponse.json(
      { ok: false, message: "Add at least one wallet address." },
      { status: 400 },
    );
  }

  await connectDB();

  await UserWalletAddress.findOneAndUpdate(
    { userId: session.user.id },
    { $set: wallets },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json({
    ok: true,
    message: "Wallets updated successfully",
    data: { wallets },
  });
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  await connectDB();

  const walletDoc = await UserWalletAddress.findOne({ userId: session.user.id }).lean<{
    bitcoinBTC?: string;
    usdtTRC20?: string;
    usdtBEP20?: string;
  } | null>();

  return NextResponse.json({
    ok: true,
    data: {
      wallets: {
        bitcoinBTC: walletDoc?.bitcoinBTC ?? "",
        usdtTRC20: walletDoc?.usdtTRC20 ?? "",
        usdtBEP20: walletDoc?.usdtBEP20 ?? "",
      },
    },
  });
}
