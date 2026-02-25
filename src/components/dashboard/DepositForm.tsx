"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEPOSIT_METHODS, type DepositMethod } from "@/lib/deposit/payment-methods";
import { Button } from "@/components/ui/button";

export function DepositForm() {
  const router = useRouter();
  const [method, setMethod] = useState<DepositMethod>("USDT_BEP20");
  const [amountUsd, setAmountUsd] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const parsedAmount = Number(amountUsd);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setSubmitError("Enter a valid amount in USD.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, amountUsd: parsedAmount }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        data?: { id?: string };
      };

      if (!response.ok || !payload.ok || !payload.data?.id) {
        setSubmitError(payload.message ?? "Unable to create deposit.");
        return;
      }

      router.push(`/dashboard/deposit/${payload.data.id}`);
    } catch {
      setSubmitError("Unable to create deposit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-xl font-semibold">Proceed with Deposit</h2>
      <p className="mt-2 text-sm text-muted">
        Enter an amount in USD you wish to deposit to your trading account with your card.
        You&apos;ll be redirect to make payment using your preferred method.
      </p>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm text-muted">
          Payment Method
          <select
            value={method}
            onChange={(event) => setMethod(event.target.value as DepositMethod)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            {DEPOSIT_METHODS.map((item) => (
              <option key={item.method} value={item.method}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-muted">
          Amount (USD)
          <input
            type="number"
            min="1"
            step="0.01"
            value={amountUsd}
            onChange={(event) => setAmountUsd(event.target.value)}
            placeholder="100"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>

        {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}

        <Button type="submit" variant="gradient" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Deposit"}
        </Button>
      </form>
    </section>
  );
}
