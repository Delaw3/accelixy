import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth/guards";
import { delCache } from "@/lib/cache/cache";
import { cacheKeys } from "@/lib/cache/keys";
import { connectDB } from "@/lib/db/mongoose";
import { accountStatusTemplate } from "@/lib/mail/admin-templates";
import { sendMailSafely } from "@/lib/mail/notify";
import User from "@/lib/models/user.model";
import { capitalizeFirstLetter } from "@/lib/utils";

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
    .select("_id isActive firstname lastname username email")
    .lean<
      {
        _id: { toString: () => string };
        isActive?: boolean;
        firstname?: string;
        lastname?: string;
        username?: string;
        email?: string;
      } | null
    >();

  if (!updated) {
    return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  }

  if (updated.email) {
    const displayName =
      `${capitalizeFirstLetter(updated.firstname)} ${capitalizeFirstLetter(updated.lastname)}`.trim() ||
      updated.username ||
      "Investor";
    const statusMail = accountStatusTemplate({
      name: displayName,
      isActive: updated.isActive !== false,
    });
    await sendMailSafely(
      {
        to: updated.email,
        subject: statusMail.subject,
        html: statusMail.html,
        text: statusMail.text,
        attachments: statusMail.attachments,
      },
      "account status notice",
    );
  }

  await delCache([
    cacheKeys.adminUsersList,
    cacheKeys.userSummary(updated._id.toString()),
  ]);

  return NextResponse.json({
    ok: true,
    message: updated.isActive ? "User activated" : "User deactivated",
    data: {
      id: updated._id.toString(),
      isActive: updated.isActive !== false,
    },
  });
}
