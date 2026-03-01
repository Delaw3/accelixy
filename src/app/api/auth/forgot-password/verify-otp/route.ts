import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/auth/password-reset-token";
import { connectDB } from "@/lib/db/mongoose";
import { handleApiError } from "@/lib/http/api-error";
import PasswordResetOtp from "@/lib/models/password-reset-otp.model";
import { forgotPasswordVerifyOtpSchema } from "@/lib/validators/password-reset";

const MAX_OTP_ATTEMPTS = 5;
const RESET_TOKEN_TTL_MINUTES = 10;

function getOtpHash(otp: string) {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "accelixy";
  return createHash("sha256").update(`${otp}:${secret}`).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordVerifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, otp } = parsed.data;
    await connectDB();

    const otpRecord = await PasswordResetOtp.findOne({
      email,
      consumedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return NextResponse.json(
        { ok: false, message: "OTP expired. Please request a new code." },
        { status: 400 }
      );
    }

    const isOtpValid = otpRecord.otpHash === getOtpHash(otp);

    if (!isOtpValid) {
      otpRecord.attempts += 1;

      if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
        await otpRecord.deleteOne();
        return NextResponse.json(
          { ok: false, message: "Too many failed attempts. Please request a new OTP." },
          { status: 400 }
        );
      } else {
        await otpRecord.save();
      }

      return NextResponse.json(
        { ok: false, message: "Incorrect OTP. Please try again." },
        { status: 400 }
      );
    }

    otpRecord.consumedAt = new Date();
    await otpRecord.save();

    const resetToken = createPasswordResetToken({
      email,
      exp: Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000,
    });

    return NextResponse.json({
      ok: true,
      message: "OTP verified.",
      data: { resetToken },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
