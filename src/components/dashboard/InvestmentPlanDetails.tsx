"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InvestmentPlan } from "@/lib/investment/plans";

type InvestmentPlanDetailsProps = {
  plan: InvestmentPlan;
};

function InfoBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-primary">
      {value}
    </span>
  );
}

export function InvestmentPlanDetails({ plan }: InvestmentPlanDetailsProps) {
  const router = useRouter();
  const [amountUsd, setAmountUsd] = useState(String(plan.minAmountUsd));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);

  const invest = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);
    const amount = Number(amountUsd);

    if (!Number.isFinite(amount) || amount <= 0) {
      setSubmitError("Enter a valid amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planKey: plan.key,
          amountUsd: amount,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        redirectTo?: string;
        data?: {
          id?: string;
        };
      };

      if (response.status === 402) {
        setShowInsufficientModal(true);
        return;
      }

      if (!response.ok || !payload.ok) {
        setSubmitError(payload.message ?? "Unable to create investment.");
        return;
      }

      if (payload.data?.id) {
        router.push(`/dashboard/investment-receipt/${payload.data.id}`);
        return;
      }

      setSubmitSuccess("Investment created successfully.");
    } catch {
      setSubmitError("Unable to create investment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-2xl font-semibold">{plan.name}</h3>
        <p className="mt-2 text-sm text-muted">{plan.description}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted">Return</p>
            <p className="text-lg font-semibold text-primary">{plan.returnRateLabel}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted">Contract Life</p>
            <p className="text-lg font-semibold">{plan.contractLifeLabel}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted">Amount Range</p>
            <p className="text-lg font-semibold">{plan.amountRangeLabel}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted">Capital will back</p>
            <InfoBadge value={plan.capitalWillBack} />
          </div>
        </div>

        <label className="mt-5 block text-sm text-muted">
          Amount (USD)
          <input
            type="number"
            min={plan.minAmountUsd}
            value={amountUsd}
            onChange={(event) => setAmountUsd(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>

        {submitError ? <p className="mt-3 text-sm text-red-400">{submitError}</p> : null}
        {submitSuccess ? <p className="mt-3 text-sm text-primary">{submitSuccess}</p> : null}

        <Button
          type="button"
          variant="gradient"
          className="mt-4"
          disabled={isSubmitting}
          onClick={() => void invest()}
        >
          {isSubmitting ? "Processing..." : "Invest"}
        </Button>
      </section>

      {showInsufficientModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg">
            <div className="flex items-center gap-2 text-red-400">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15">
                <CircleX className="h-5 w-5" />
              </span>
              <h4 className="text-lg font-semibold text-foreground">Insufficient Funds</h4>
            </div>
            <p className="mt-2 text-sm text-muted">
              Your balance is not enough for this investment. Please fund your account to continue.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowInsufficientModal(false)}>
                Close
              </Button>
              <Button
                type="button"
                variant="gradient"
                onClick={() => router.push("/dashboard/deposit")}
              >
                Fund Account
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
