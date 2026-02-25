export type InvestmentPlan = {
  key: "FIRST_PLAN" | "SECOUND_PLAN" | "COMPOUND_PLAN" | "MINING_PLAN";
  name: string;
  description: string;
  returnRateLabel: string;
  roiPercent: number;
  contractLifeLabel: string;
  durationHours: number;
  capitalWillBack: string;
  referralCommission: string;
  minAmountUsd: number;
  maxAmountUsd: number | null;
  amountRangeLabel: string;
};

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    key: "FIRST_PLAN",
    name: "First Plan",
    description:
      "A short-term plan designed for quick entry and fast cycle returns.",
    returnRateLabel: "5%",
    roiPercent: 5,
    contractLifeLabel: "24 Hours",
    durationHours: 24,
    capitalWillBack: "Yes",
    referralCommission: "3%",
    minAmountUsd: 50,
    maxAmountUsd: 5000,
    amountRangeLabel: "$50.00 - $5000.00",
  },
  {
    key: "SECOUND_PLAN",
    name: "Secound Plan",
    description:
      "A mid-range growth option with higher return rate and moderate duration.",
    returnRateLabel: "11.00%",
    roiPercent: 11,
    contractLifeLabel: "40 hours",
    durationHours: 40,
    capitalWillBack: "Yes",
    referralCommission: "3%",
    minAmountUsd: 1000,
    maxAmountUsd: 25000,
    amountRangeLabel: "$1000.00 - $25000.00",
  },
  {
    key: "COMPOUND_PLAN",
    name: "Compound Plan",
    description:
      "A weekly compounding-style plan for users targeting steady portfolio growth.",
    returnRateLabel: "6.00%",
    roiPercent: 6,
    contractLifeLabel: "7 Days",
    durationHours: 7 * 24,
    capitalWillBack: "Yes",
    referralCommission: "3%",
    minAmountUsd: 1000,
    maxAmountUsd: null,
    amountRangeLabel: "$1000.00 - $Unlimited",
  },
  {
    key: "MINING_PLAN",
    name: "Mining Plan",
    description:
      "A high-cap plan built for larger allocations over a 7-day contract window.",
    returnRateLabel: "10.00%",
    roiPercent: 10,
    contractLifeLabel: "7 days",
    durationHours: 7 * 24,
    capitalWillBack: "Yes",
    referralCommission: "3%",
    minAmountUsd: 5000,
    maxAmountUsd: 40000,
    amountRangeLabel: "$5000.00 - $40000.00",
  },
];

export function getInvestmentPlanByKey(key: string) {
  return INVESTMENT_PLANS.find((plan) => plan.key === key);
}
