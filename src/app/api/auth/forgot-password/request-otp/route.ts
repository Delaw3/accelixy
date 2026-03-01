import { createHash, randomInt } from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { handleApiError } from "@/lib/http/api-error";
import { sendMail } from "@/lib/mail/mailer";
import { passwordResetOtpTemplate } from "@/lib/mail/template/password-reset-otp-template";
import PasswordResetOtp from "@/lib/models/password-reset-otp.model";
import User from "@/lib/models/user.model";
import { capitalizeFirstLetter } from "@/lib/utils";
import { forgotPasswordRequestSchema } from "@/lib/validators/password-reset";

const OTP_TTL_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 60;

function getOtpHash(otp: string) {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "accelixy";
  return createHash("sha256").update(`${otp}:${secret}`).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: parsed.data.email })
      .select("_id firstname email isActive")
      .lean<{ _id: { toString: () => string }; firstname?: string; email?: string; isActive?: boolean } | null>();

    if (!user?.email || user.isActive === false) {
      return NextResponse.json(
        { ok: false, message: "No account found with this email." },
        { status: 404 }
      );
    }

    const now = new Date();
    const existingOtp = await PasswordResetOtp.findOne({
      email: user.email,
      consumedAt: null,
      expiresAt: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .lean<{ createdAt?: Date } | null>();

    if (existingOtp?.createdAt) {
      const cooldownCutoff = new Date(existingOtp.createdAt.getTime() + OTP_COOLDOWN_SECONDS * 1000);
      if (cooldownCutoff > now) {
        return NextResponse.json({
          ok: true,
          message: "OTP already sent. Please wait a minute before requesting again.",
        });
      }
    }

    await PasswordResetOtp.deleteMany({
      email: user.email,
      consumedAt: null,
    });

    const otp = String(randomInt(100000, 1000000));
    const expiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);

    await PasswordResetOtp.create({
      userId: user._id,
      email: user.email,
      otpHash: getOtpHash(otp),
      attempts: 0,
      expiresAt,
      consumedAt: null,
    });

    const template = passwordResetOtpTemplate({
      name: capitalizeFirstLetter(user.firstname ?? "User"),
      otp,
    });

    await sendMail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      attachments: template.attachments,
    });

    return NextResponse.json({
      ok: true,
      message: "OTP sent successfully.",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
