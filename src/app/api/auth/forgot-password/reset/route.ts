import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { verifyPasswordResetToken } from "@/lib/auth/password-reset-token";
import { connectDB } from "@/lib/db/mongoose";
import { handleApiError } from "@/lib/http/api-error";
import PasswordResetOtp from "@/lib/models/password-reset-otp.model";
import User from "@/lib/models/user.model";
import { forgotPasswordResetSchema } from "@/lib/validators/password-reset";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordResetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { resetToken, newPassword } = parsed.data;
    const tokenPayload = verifyPasswordResetToken(resetToken);

    if (!tokenPayload?.email) {
      return NextResponse.json(
        { ok: false, message: "Reset session is invalid or expired. Please verify OTP again." },
        { status: 400 }
      );
    }

    const email = tokenPayload.email;

    await connectDB();

    const user = await User.findOne({ email }).select("+password email");
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Reset session is invalid or expired. Please verify OTP again." },
        { status: 400 }
      );
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { ok: false, message: "New password must be different from old password." },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    await PasswordResetOtp.deleteMany({ email: user.email });

    return NextResponse.json({
      ok: true,
      message: "Password reset successful. You can now sign in.",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
