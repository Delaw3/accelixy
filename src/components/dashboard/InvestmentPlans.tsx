"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { INVESTMENT_PLANS } from "@/lib/investment/plans";

function InfoBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-primary">
      {value}
    </span>
  );
}

export function InvestmentPlans() {
  return (
    <section className="space-y-4">
      <h3 className="text-2xl font-semibold md:text-3xl">Investment Plans</h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {INVESTMENT_PLANS.map((plan) => (
          <article
            key={plan.key}
            className="flex h-full flex-col rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-lg font-semibold">{plan.name}</h4>
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-right">
                <p className="text-sm font-bold text-primary">{plan.returnRateLabel}</p>
                <p className="text-[11px] text-muted">Return</p>
              </div>
            </div>

            <div className="my-4 h-px bg-border" />

            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted">Contract Life</span>
                <span className="font-medium">{plan.contractLifeLabel}</span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted">Capital will back</span>
                <InfoBadge value={plan.capitalWillBack} />
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted">Referral Comission</span>
                <InfoBadge value={plan.referralCommission} />
              </li>
            </ul>

            <p className="mt-5 text-center text-sm font-medium text-primary">
              {plan.amountRangeLabel}
            </p>

            <p className="mt-3 text-sm text-muted">{plan.description}</p>

            <Link href={`/dashboard/investment-plans/${plan.key}`} className="mt-4">
              <Button type="button" variant="gradient" className="w-full">
                View Plan
              </Button>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
