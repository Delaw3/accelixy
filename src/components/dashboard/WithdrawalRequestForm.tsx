"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type WalletType = "bitcoinBTC" | "usdtTRC20" | "usdtBEP20";

type WalletData = {
  bitcoinBTC: string;
  usdtTRC20: string;
  usdtBEP20: string;
};

type WithdrawalRequestFormProps = {
  wallets: WalletData;
};

const walletOptions: { key: WalletType; label: string }[] = [
  { key: "usdtBEP20", label: "USDT BEP20" },
  { key: "usdtTRC20", label: "USDT TRC20" },
  { key: "bitcoinBTC", label: "BTC" },
];

export function WithdrawalRequestForm({ wallets }: WithdrawalRequestFormProps) {
  const router = useRouter();
  const [amountUsd, setAmountUsd] = useState("");
  const defaultWallet = useMemo(
    () => walletOptions.find((item) => Boolean(wallets[item.key]?.trim()))?.key ?? null,
    [wallets]
  );
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(defaultWallet);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAddress = selectedWallet ? wallets[selectedWallet]?.trim() ?? "" : "";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const amount = Number(amountUsd);
    if (!Number.isFinite(amount) || amount <= 0) {
      setSubmitError("Enter a valid amount in USD.");
      return;
    }

    if (!selectedWallet || !selectedAddress) {
      setSubmitError("No wallet found. Go to your profile and add at least one wallet address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUsd: amount,
          walletType: selectedWallet,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        data?: { id?: string };
      };

      if (!response.ok || !payload.ok || !payload.data?.id) {
        setSubmitError(payload.message ?? "Unable to request withdrawal.");
        return;
      }

      router.push(`/dashboard/withdrawal-receipt/${payload.data.id}`);
    } catch {
      setSubmitError("Unable to request withdrawal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-2xl font-semibold md:text-3xl">Request withdrawal</h3>
      <p className="mt-2 text-sm text-muted">
        Enter an amount in USD you wish to request for. Your withdrawal will be processed.
      </p>

      <form className="mt-5 space-y-4" onSubmit={submit}>
        <label className="block text-sm text-muted">
          Amount (USD)
          <input
            type="number"
            min="1"
            step="0.01"
            value={amountUsd}
            onChange={(event) => setAmountUsd(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>

        <div>
          <p className="mb-2 text-sm text-muted">Select Wallet</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {walletOptions.map((option) => {
              const isAvailable = Boolean(wallets[option.key]?.trim());
              const isSelected = selectedWallet === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setSelectedWallet(option.key)}
                  className={[
                    "rounded-md border px-3 py-2 text-sm text-left transition",
                    isAvailable
                      ? "border-border bg-background hover:border-primary"
                      : "cursor-not-allowed border-border/50 bg-background/40 text-muted/60",
                    isSelected ? "border-primary text-primary" : "text-foreground",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted">Selected Wallet Address</p>
          <p className="mt-1 break-all text-sm font-semibold text-foreground">
            {selectedAddress || "No wallet selected"}
          </p>
        </div>

        {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}

        <Button type="submit" variant="gradient" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Request Withdrawal"}
        </Button>
      </form>
    </section>
  );
}
