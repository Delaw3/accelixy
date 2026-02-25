import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/user.model";

const passwordPayloadSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parsed = passwordPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Validation failed", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();

  const user = await User.findById(session.user.id).select("+password");
  if (!user?.password) {
    return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  }

  const isOldPasswordCorrect = await bcrypt.compare(parsed.data.oldPassword, user.password);
  if (!isOldPasswordCorrect) {
    return NextResponse.json(
      { ok: false, message: "Old password is incorrect." },
      { status: 400 },
    );
  }

  const isSamePassword = await bcrypt.compare(parsed.data.newPassword, user.password);
  if (isSamePassword) {
    return NextResponse.json(
      { ok: false, message: "New password must be different from old password." },
      { status: 400 },
    );
  }

  user.password = await bcrypt.hash(parsed.data.newPassword, 12);
  await user.save();

  return NextResponse.json({
    ok: true,
    message: "Password reset successful",
  });
}
