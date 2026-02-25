import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/user.model";

type Params = {
  params: Promise<{ id: string }>;
};

const statusSchema = z.object({
  isActive: z.boolean(),
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
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }

  const { id } = await params;
  await connectDB();

  const updated = await User.findByIdAndUpdate(
    id,
    { $set: { isActive: parsed.data.isActive } },
    { new: true },
  )
    .select("_id isActive")
    .lean<{ _id: { toString: () => string }; isActive?: boolean } | null>();

  if (!updated) {
    return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    message: updated.isActive ? "User activated" : "User deactivated",
    data: {
      id: updated._id.toString(),
      isActive: updated.isActive !== false,
    },
  });
}
