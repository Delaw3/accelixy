"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type WalletReminderProps = {
  initialHasWallet: boolean;
  initialWallets: {
    bitcoinBTC: string;
    usdtTRC20: string;
    usdtBEP20: string;
  };
};

type FormState = {
  bitcoinBTC: string;
  usdtTRC20: string;
  usdtBEP20: string;
};

function hasWalletValue(values: FormState) {
  return Boolean(
    values.bitcoinBTC.trim() ||
      values.usdtTRC20.trim() ||
      values.usdtBEP20.trim(),
  );
}

export function WalletReminder({
  initialHasWallet,
  initialWallets,
}: WalletReminderProps) {
  const [hasWallet, setHasWallet] = useState(initialHasWallet);
  const [isModalOpen, setIsModalOpen] = useState(!initialHasWallet);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<FormState>(initialWallets);

  useEffect(() => {
    if (!submitSuccess) {
      return;
    }

    const timer = setTimeout(() => {
      setSubmitSuccess(null);
    }, 2500);

    return () => clearTimeout(timer);
  }, [submitSuccess]);

  const openModal = () => {
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!hasWalletValue(form)) {
      setSubmitError("Add at least one wallet address for withdrawers.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/user/wallets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        setSubmitError(payload.message ?? "Unable to save wallets right now.");
        return;
      }

      setHasWallet(true);
      setIsModalOpen(false);
      setSubmitSuccess("Wallet addresses added successfully.");
    } catch {
      setSubmitError("Unable to save wallets right now.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {!hasWallet ? (
        <button
          type="button"
          onClick={openModal}
          className="w-full rounded-lg border border-red-400/60 bg-card px-4 py-3 text-left text-sm text-foreground transition hover:border-red-400"
        >
          <span className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <span>
              <span className="block font-semibold text-red-400">
                Action required: Add at least one wallet address for withdrawers.
              </span>
              <span className="mt-0.5 block text-muted">Click to add wallet now.</span>
            </span>
          </span>
        </button>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
            <h4 className="text-lg font-semibold">Add Wallet Address</h4>
            <p className="mt-1 text-sm text-muted">
              Add at least one wallet address for withdrawers.
            </p>
            <p className="mt-2 rounded-md border border-primary/50 bg-background px-3 py-2 text-xs text-primary">
              Ensure wallet addresses are correct before submitting. Incorrect addresses can
              result in permanent loss of funds.
            </p>

            <form className="mt-4 space-y-3" onSubmit={onSubmit}>
              <label className="block text-sm text-muted">
                Bitcoin BTC
                <input
                  type="text"
                  value={form.bitcoinBTC}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, bitcoinBTC: event.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="Enter BTC wallet address"
                />
              </label>

              <label className="block text-sm text-muted">
                USDT TRC20
                <input
                  type="text"
                  value={form.usdtTRC20}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, usdtTRC20: event.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="Enter USDT TRC20 address"
                />
              </label>

              <label className="block text-sm text-muted">
                USDT BEP20
                <input
                  type="text"
                  value={form.usdtBEP20}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, usdtBEP20: event.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="Enter USDT BEP20 address"
                />
              </label>

              {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  Skip
                </Button>
                <Button type="submit" variant="gradient" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Wallets"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {submitSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4 text-center shadow-lg">
            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="mt-2 text-sm font-semibold text-primary">{submitSuccess}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
