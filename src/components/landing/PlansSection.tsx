import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { INVESTMENT_PLANS } from "@/lib/investment/plans";

function InfoBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-primary">
      {value}
    </span>
  );
}

export function PlansSection() {
  return (
    <section id="plans" className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
      <h2 className="text-center text-2xl font-semibold uppercase md:text-3xl">
        Our Mining Plans
      </h2>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {INVESTMENT_PLANS.map((plan) => (
          <article
            key={plan.key}
            className="flex h-full flex-col rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
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

            <p className="mt-6 text-center text-sm font-medium text-primary">
              {plan.amountRangeLabel}
            </p>

            <Link href="/login" className={buttonStyles("primary", "mt-5 w-full")}>
              Invest Now
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
