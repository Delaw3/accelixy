import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import TransactionNotification from "@/lib/models/transaction-notification.model";

type Params = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const deleted = await TransactionNotification.findOneAndDelete({
    _id: id,
    userId: session.user.id,
  }).lean();

  if (!deleted) {
    return NextResponse.json({ ok: false, message: "Notification not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, message: "Notification cleared" });
}
