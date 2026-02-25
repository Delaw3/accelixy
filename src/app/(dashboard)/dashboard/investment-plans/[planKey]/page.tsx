import { notFound } from "next/navigation";
import { InvestmentPlanDetails } from "@/components/dashboard/InvestmentPlanDetails";
import { getInvestmentPlanByKey } from "@/lib/investment/plans";

type Params = {
  params: Promise<{ planKey: string }>;
};

export default async function InvestmentPlanDetailPage({ params }: Params) {
  const { planKey } = await params;
  const plan = getInvestmentPlanByKey(planKey);

  if (!plan) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <InvestmentPlanDetails plan={plan} />
    </div>
  );
}
