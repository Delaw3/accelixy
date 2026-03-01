import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/user.model";
import { capitalizeFirstLetter } from "@/lib/utils";

const profilePayloadSchema = z.object({
  firstname: z.string().trim().min(1, "First name is required"),
  lastname: z.string().trim().min(1, "Last name is required"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username contains invalid characters"),
  country: z.string().trim().min(1, "Country is required"),
  phone: z.string().trim().min(5, "Phone is required"),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  await connectDB();

  const user = await User.findById(session.user.id)
    .select("firstname lastname username email country phone referralCode")
    .lean<{
      firstname: string;
      lastname: string;
      username: string;
      email: string;
      country: string;
      phone: string;
      referralCode: string;
    } | null>();

  if (!user) {
    return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    data: {
      firstname: capitalizeFirstLetter(user.firstname),
      lastname: capitalizeFirstLetter(user.lastname),
      username: user.username,
      email: user.email,
      country: user.country,
      phone: user.phone,
      referralCode: user.referralCode,
    },
  });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parsed = profilePayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Validation failed", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();

  const normalizedUsername = parsed.data.username.toLowerCase();

  const existingUsername = await User.findOne({
    username: normalizedUsername,
    _id: { $ne: session.user.id },
  })
    .select("_id")
    .lean<{ _id: unknown } | null>();

  if (existingUsername) {
    return NextResponse.json(
      { ok: false, message: "Username is already taken." },
      { status: 409 },
    );
  }

  const updated = await User.findByIdAndUpdate(
    session.user.id,
    {
      $set: {
        firstname: parsed.data.firstname.trim().toLowerCase(),
        lastname: parsed.data.lastname.trim().toLowerCase(),
        username: normalizedUsername,
        country: parsed.data.country.trim(),
        phone: parsed.data.phone.trim(),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .select("firstname lastname username email country phone referralCode")
    .lean<{
      firstname: string;
      lastname: string;
      username: string;
      email: string;
      country: string;
      phone: string;
      referralCode: string;
    } | null>();

  if (!updated) {
    return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    message: "Profile updated successfully",
    data: {
      ...updated,
      firstname: capitalizeFirstLetter(updated.firstname),
      lastname: capitalizeFirstLetter(updated.lastname),
    },
  });
}
