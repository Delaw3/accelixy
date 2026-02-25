import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/user.model";
import Investment from "@/lib/models/investment.model";
import Withdrawal from "@/lib/models/withdrawal.model";
import { requireAdminUser } from "@/lib/auth/guards";

export async function GET() {
  const adminCheck = await requireAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json(
      { ok: false, message: adminCheck.message },
      { status: adminCheck.status },
    );
  }

  await connectDB();

  const userRoleFilter = { $in: ["USER", "user", "client"] };

  const [users, totalUsers, pendingWithdrawals, activeInvestments] = await Promise.all([
    User.find({ role: userRoleFilter })
      .select("firstname lastname email country createdAt isActive")
      .sort({ createdAt: -1 })
      .lean<
        {
          _id: { toString: () => string };
          firstname: string;
          lastname: string;
          email: string;
          country: string;
          createdAt?: Date;
          isActive?: boolean;
        }[]
      >(),
    User.countDocuments({ role: userRoleFilter }),
    Withdrawal.countDocuments({ status: "PENDING" }),
    Investment.countDocuments({ status: "ACTIVE" }),
  ]);

  return NextResponse.json({
    ok: true,
    data: {
      stats: {
        totalUsers,
        pendingWithdrawals,
        activeInvestments,
      },
      users: users.map((user) => ({
        id: user._id.toString(),
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        country: user.country,
        createdAt: user.createdAt,
        isActive: user.isActive !== false,
      })),
    },
  });
}
