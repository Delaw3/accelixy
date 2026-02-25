import { Types } from "mongoose";
import Investment from "@/lib/models/investment.model";
import Withdrawal from "@/lib/models/withdrawal.model";

type DashboardFinancialStats = {
  currentInvestment: number;
  totalWithdrawals: number;
};

export async function getDashboardFinancialStats(
  userId: string
): Promise<DashboardFinancialStats> {
  const objectId = new Types.ObjectId(userId);

  const [investmentSummary, withdrawalSummary] = await Promise.all([
    Investment.aggregate<{ total: number }>([
      { $match: { userId: objectId, status: "ACTIVE" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Withdrawal.aggregate<{ total: number }>([
      { $match: { userId: objectId, status: "APPROVED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  return {
    currentInvestment: investmentSummary[0]?.total ?? 0,
    totalWithdrawals: withdrawalSummary[0]?.total ?? 0,
  };
}
