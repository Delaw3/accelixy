import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import {
  depositApprovedTemplate,
  generalNoticeTemplate,
  investmentPaidTemplate,
  welcomeTemplate,
  withdrawalUpdateTemplate,
} from "@/lib/mail/admin-templates";
import { sendMail } from "@/lib/mail/mailer";
import User from "@/lib/models/user.model";

const payloadSchema = z.object({
  userId: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  subject: z.string().trim().min(1),
  templateKey: z.enum(["welcome", "depositApproved", "investmentPaid", "withdrawalUpdate", "custom"]).optional(),
  templateVars: z.record(z.string(), z.string()).optional(),
  message: z.string().trim().optional(),
});

export async function POST(request: Request) {
  const adminCheck = await requireAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json(
      { ok: false, message: adminCheck.message },
      { status: adminCheck.status },
    );
  }

  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }

  await connectDB();

  const { userId, email, subject, templateKey = "custom", templateVars, message } = parsed.data;
  let targetEmail = email ?? "";
  let targetName = "Investor";

  if (userId) {
    const targetUser = await User.findById(userId)
      .select("firstname email")
      .lean<{ firstname?: string; email?: string } | null>();

    if (!targetUser?.email) {
      return NextResponse.json({ ok: false, message: "Target user not found." }, { status: 404 });
    }

    targetEmail = targetUser.email;
    targetName = targetUser.firstname ?? targetName;
  }

  if (!targetEmail) {
    return NextResponse.json({ ok: false, message: "Provide userId or email." }, { status: 400 });
  }

  let composed: { subject: string; html: string; text: string };

  if (templateKey === "investmentPaid") {
    composed = investmentPaidTemplate({
      name: targetName,
      amount: templateVars?.amount ?? "$0.00",
      plan: templateVars?.plan ?? "Investment Plan",
    });
  } else if (templateKey === "welcome") {
    composed = welcomeTemplate({ name: targetName });
  } else if (templateKey === "depositApproved") {
    composed = depositApprovedTemplate({
      name: targetName,
      amount: templateVars?.amount ?? "$0.00",
    });
  } else if (templateKey === "withdrawalUpdate") {
    composed = withdrawalUpdateTemplate({
      name: targetName,
      status: templateVars?.status ?? "PENDING",
      amount: templateVars?.amount ?? "$0.00",
    });
  } else {
    composed = generalNoticeTemplate({
      name: targetName,
      subject,
      message: message || templateVars?.message || "We have an update for your account.",
    });
  }

  await sendMail({
    to: targetEmail,
    subject: composed.subject || subject,
    html: composed.html,
    text: composed.text,
  });

  return NextResponse.json({ ok: true, message: "Mail sent successfully." });
}
