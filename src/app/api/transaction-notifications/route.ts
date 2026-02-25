import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import TransactionNotification from "@/lib/models/transaction-notification.model";

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 10), 50);
  const skip = (page - 1) * limit;

  await connectDB();

  const [items, totalItems] = await Promise.all([
    TransactionNotification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<{
        _id: { toString: () => string };
        type: "deposit" | "withdrawal" | "investment";
        message: string;
        amount: number;
        createdAt?: Date;
      }[]>(),
    TransactionNotification.countDocuments({ userId: session.user.id }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return NextResponse.json({
    ok: true,
    data: items.map((item) => ({
      id: item._id.toString(),
      type: item.type,
      message: item.message,
      amount: item.amount,
      createdAt: item.createdAt,
    })),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  });
}
