import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import DepositHistory from "@/lib/models/deposit-history.model";

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

  const deleted = await DepositHistory.findOneAndDelete({
    _id: id,
    userId: session.user.id,
  }).lean();

  if (!deleted) {
    return NextResponse.json({ ok: false, message: "Deposit not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, message: "Deposit deleted" });
}
