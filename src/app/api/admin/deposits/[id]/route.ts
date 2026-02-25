import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import DepositHistory from "@/lib/models/deposit-history.model";

type Params = {
  params: Promise<{ id: string }>;
};

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

  const deleted = await DepositHistory.findByIdAndDelete(id).lean<{ _id: { toString: () => string } } | null>();
  if (!deleted) {
    return NextResponse.json({ ok: false, message: "Deposit request not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    message: "Deposit request deleted",
    data: { id: deleted._id.toString() },
  });
}
