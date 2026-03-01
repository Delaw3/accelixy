import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth/guards";
import { delCache } from "@/lib/cache/cache";
import { cacheKeys } from "@/lib/cache/keys";
import { connectDB } from "@/lib/db/mongoose";
import { adminCreditUserTemplate } from "@/lib/mail/admin-templates";
import { formatUsd, sendMailSafely } from "@/lib/mail/notify";
import TransactionNotification from "@/lib/models/transaction-notification.model";
import User from "@/lib/models/user.model";
import UserWallet from "@/lib/models/user-wallet.model";
import UserWalletAddress from "@/lib/models/user-wallet-address.model";
import { capitalizeFirstLetter } from "@/lib/utils";

type Params = {
  params: Promise<{ id: string }>;
};

const updateUserSchema = z.object({
  firstname: z.string().trim().min(1, "First name is required"),
  lastname: z.string().trim().min(1, "Last name is required"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username contains invalid characters"),
  walletBalance: z.number().min(0, "Wallet balance cannot be negative"),
  bitcoinBTC: z.string().trim().max(200).optional().or(z.literal("")),
  usdtTRC20: z.string().trim().max(200).optional().or(z.literal("")),
  usdtBEP20: z.string().trim().max(200).optional().or(z.literal("")),
});

export async function PATCH(request: Request, { params }: Params) {
  const adminCheck = await requireAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json(
      { ok: false, message: adminCheck.message },
      { status: adminCheck.status },
    );
  }

  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }

  const { id } = await params;
  await connectDB();
  const nextWalletBalance = Number(parsed.data.walletBalance.toFixed(2));

  const normalizedUsername = parsed.data.username.trim().toLowerCase();
  const duplicateUsername = await User.findOne({
    _id: { $ne: id },
    username: normalizedUsername,
  })
    .select("_id")
    .lean<{ _id: { toString: () => string } } | null>();

  if (duplicateUsername) {
    return NextResponse.json({ ok: false, message: "Username is already taken." }, { status: 409 });
  }

  const existingUser = await User.findById(id)
    .select("_id")
    .lean<{ _id: { toString: () => string } } | null>();
  if (!existingUser) {
    return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  }

  const previousWallet = await UserWallet.findOne({ userId: id })
    .select("balance")
    .lean<{ balance?: number } | null>();
  const previousBalance = Number(previousWallet?.balance ?? 0);

  if (nextWalletBalance < previousBalance) {
    return NextResponse.json(
      {
        ok: false,
        message: "Only an increment is allowed for wallet balance.",
        data: { walletBalance: previousBalance },
      },
      { status: 400 },
    );
  }

  const user = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        firstname: parsed.data.firstname,
        lastname: parsed.data.lastname,
        username: normalizedUsername,
      },
    },
    { new: true },
  )
    .select("_id firstname lastname username email")
    .lean<
      {
        _id: { toString: () => string };
        firstname: string;
        lastname: string;
        username: string;
        email?: string;
      } | null
    >();

  if (!user) {
    return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  }

  const creditedAmount = Number((nextWalletBalance - previousBalance).toFixed(2));

  await Promise.all([
    UserWallet.findOneAndUpdate(
      { userId: id },
      {
        $set: {
          balance: nextWalletBalance,
          currency: "USD",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ),
    UserWalletAddress.findOneAndUpdate(
      { userId: id },
      {
        $set: {
          bitcoinBTC: parsed.data.bitcoinBTC ?? "",
          usdtTRC20: parsed.data.usdtTRC20 ?? "",
          usdtBEP20: parsed.data.usdtBEP20 ?? "",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ),
  ]);

  if (creditedAmount > 0) {
    await TransactionNotification.create({
      userId: id,
      type: "deposit",
      message: "Your account was credited by admin.",
      amount: creditedAmount,
      status: "APPROVED",
    });

    if (user.email) {
      const displayName =
        `${capitalizeFirstLetter(user.firstname)} ${capitalizeFirstLetter(user.lastname)}`.trim() ||
        user.username;
      const creditMail = adminCreditUserTemplate({
        name: displayName,
        amount: formatUsd(creditedAmount),
        balance: formatUsd(nextWalletBalance),
      });
      await sendMailSafely(
        {
          to: user.email,
          subject: creditMail.subject,
          html: creditMail.html,
          text: creditMail.text,
          attachments: creditMail.attachments,
        },
        "admin credit user notice",
      );
    }
  }

  await delCache([
    cacheKeys.adminUsersList,
    cacheKeys.userSummary(id),
  ]);

  return NextResponse.json({
    ok: true,
    message: "User updated successfully.",
    data: {
      id: user._id.toString(),
      firstname: capitalizeFirstLetter(user.firstname),
      lastname: capitalizeFirstLetter(user.lastname),
      username: user.username,
      walletBalance: nextWalletBalance,
      bitcoinBTC: parsed.data.bitcoinBTC ?? "",
      usdtTRC20: parsed.data.usdtTRC20 ?? "",
      usdtBEP20: parsed.data.usdtBEP20 ?? "",
    },
  });
}

export async function DELETE(_: Request, { params }: Params) {
  const adminCheck = await requireAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json(
      { ok: false, message: adminCheck.message },
      { status: adminCheck.status },
    );
  }

  const { id } = await params;
  await connectDB();

  const deleted = await User.findByIdAndDelete(id)
    .select("_id")
    .lean<{ _id: { toString: () => string } } | null>();

  if (!deleted) {
    return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  }

  await Promise.all([
    UserWallet.deleteOne({ userId: id }),
    UserWalletAddress.deleteOne({ userId: id }),
  ]);

  await delCache([
    cacheKeys.adminUsersList,
    cacheKeys.userSummary(id),
  ]);

  return NextResponse.json({
    ok: true,
    message: "User deleted successfully.",
    data: { id: deleted._id.toString() },
  });
}
