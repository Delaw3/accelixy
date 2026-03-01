import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth/guards";
import { delCache } from "@/lib/cache/cache";
import { cacheKeys } from "@/lib/cache/keys";
import { connectDB } from "@/lib/db/mongoose";
import TransactionNotification from "@/lib/models/transaction-notification.model";
import UserWallet from "@/lib/models/user-wallet.model";
import Withdrawal from "@/lib/models/withdrawal.model";

type Params = {
  params: Promise<{ id: string }>;
};

const updateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
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
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }

  const { id } = await params;
  await connectDB();
  const dbSession = await mongoose.startSession();

  try {
    let result: { id: string; status: "PENDING" | "APPROVED" | "REJECTED" } | null = null;
    let affectedUserId: string | null = null;

    await dbSession.withTransaction(async () => {
      const withdrawal = await Withdrawal.findById(id).session(dbSession);
      if (!withdrawal) {
        throw new Error("NOT_FOUND");
      }

      const nextStatus = parsed.data.status;
      const previousStatus = withdrawal.status;

      if (previousStatus !== "PENDING") {
        throw new Error("ALREADY_PROCESSED");
      }

      if (nextStatus === "APPROVED") {
        const wallet = await UserWallet.findOne({ userId: withdrawal.userId }).session(dbSession);
        if (!wallet) {
          throw new Error("WALLET_NOT_FOUND");
        }
        if (wallet.balance < withdrawal.amount) {
          throw new Error("INSUFFICIENT_BALANCE");
        }
        wallet.balance = Number((wallet.balance - withdrawal.amount).toFixed(2));
        await wallet.save({ session: dbSession });
      }

      withdrawal.status = nextStatus;
      await withdrawal.save({ session: dbSession });

      await TransactionNotification.create(
        [
          {
            userId: withdrawal.userId,
            type: "withdrawal",
            message: `Withdrawal request ${nextStatus.toLowerCase()}`,
            amount: withdrawal.amount,
            status: nextStatus,
          },
        ],
        { session: dbSession },
      );

      result = { id: withdrawal._id.toString(), status: withdrawal.status };
      affectedUserId = withdrawal.userId.toString();
    });

    if (!result) {
      throw new Error("UPDATE_FAILED");
    }

    if (affectedUserId) {
      await delCache([
        cacheKeys.adminWithdrawalsList,
        cacheKeys.adminUsersList,
        cacheKeys.userSummary(affectedUserId),
      ]);
    }

    return NextResponse.json({
      ok: true,
      message: "Withdrawal updated",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ ok: false, message: "Withdrawal not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "WALLET_NOT_FOUND") {
      return NextResponse.json({ ok: false, message: "User wallet not found" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json(
        { ok: false, message: "User has insufficient wallet balance for this withdrawal." },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message === "ALREADY_PROCESSED") {
      return NextResponse.json(
        { ok: false, message: "This withdrawal has already been processed and is locked." },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: false, message: "Unable to update withdrawal" }, { status: 500 });
  } finally {
    await dbSession.endSession();
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const adminCheck = await requireAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json(
      { ok: false, message: adminCheck.message },
      { status: adminCheck.status },
    );
  }

  const { id } = await params;
  await connectDB();

  const existingWithUser = await Withdrawal.findById(id)
    .select("status userId")
    .lean<{ status?: "PENDING" | "APPROVED" | "REJECTED"; userId?: { toString: () => string } } | null>();
  if (!existingWithUser) {
    return NextResponse.json({ ok: false, message: "Withdrawal not found" }, { status: 404 });
  }
  if (existingWithUser.status !== "PENDING") {
    return NextResponse.json(
      { ok: false, message: "Processed withdrawals cannot be deleted." },
      { status: 400 },
    );
  }

  const deleted = await Withdrawal.findByIdAndDelete(id).lean<{ _id: { toString: () => string } } | null>();
  if (!deleted) {
    return NextResponse.json({ ok: false, message: "Withdrawal not found" }, { status: 404 });
  }

  const keysToDelete = [cacheKeys.adminWithdrawalsList, cacheKeys.adminUsersList];
  if (existingWithUser.userId) {
    keysToDelete.push(cacheKeys.userSummary(existingWithUser.userId.toString()));
  }
  await delCache(keysToDelete);

  return NextResponse.json({
    ok: true,
    message: "Withdrawal deleted",
    data: { id: deleted._id.toString() },
  });
}
