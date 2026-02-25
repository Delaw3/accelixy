import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { handleApiError } from "@/lib/http/api-error";
import Referral from "@/lib/models/referral.model";
import User from "@/lib/models/user.model";
import UserStats from "@/lib/models/user-stats.model";
import UserWallet from "@/lib/models/user-wallet.model";
import UserWalletAddress from "@/lib/models/user-wallet-address.model";
import { generateReferralCode } from "@/lib/referrals/referral-code";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const payload = registerSchema.parse(body);
    const { confirmPassword: _confirmPassword, ...parsedUserData } = payload;
    void _confirmPassword;
    const referralCodeInput = parsedUserData.referralCode?.trim().toUpperCase() || "";
    const { referralCode: _ignoredReferralCode, ...restUserData } = parsedUserData;
    void _ignoredReferralCode;
    const userData = {
      ...restUserData,
      firstname: restUserData.firstname.trim().toLowerCase(),
      lastname: restUserData.lastname.trim().toLowerCase(),
      email: restUserData.email.trim().toLowerCase(),
      username: restUserData.username.trim().toLowerCase(),
    };

    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { username: userData.username }],
    }).lean();

    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: "Email or username already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const generatedReferralCode = await generateReferralCode();
    let referrerId: string | null = null;

    if (referralCodeInput) {
      const referrer = await User.findOne({ referralCode: referralCodeInput })
        .select("_id")
        .lean<{ _id: { toString: () => string } } | null>();

      if (!referrer) {
        return NextResponse.json(
          { ok: false, message: "Invalid referral code" },
          { status: 400 }
        );
      }

      referrerId = referrer._id.toString();
    }

    const user = await User.create({
      ...userData,
      password: hashedPassword,
      role: "USER",
      isActive: true,
      referralCode: generatedReferralCode,
      referredBy: referrerId,
      referralRewardPaid: false,
      referralFirstDepositRewardedAt: null,
    });

    await Promise.all([
      UserWallet.create({
        userId: user._id,
        balance: 0,
        currency: "USD",
      }),
      UserStats.create({
        userId: user._id,
        totalEarnings: 0,
        totalWithdrawals: 0,
      }),
      UserWalletAddress.create({
        userId: user._id,
        bitcoinBTC: "",
        usdtTRC20: "",
        usdtBEP20: "",
      }),
    ]);

    if (referrerId) {
      await Referral.create({
        referrerId,
        referredUserId: user._id,
        code: referralCodeInput,
        rewardStatus: "PENDING",
      });
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Registration successful",
        data: {
          user: {
            id: user._id.toString(),
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            country: user.country,
            phone: user.phone,
            role: user.role,
            referralCode: user.referralCode,
          },
        },
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
