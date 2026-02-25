"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type DepositCheckoutProps = {
  depositId: string;
  methodLabel: string;
  amountUsd: number;
  address: string;
  qrCodeUrl: string;
  reference: string;
  initialUserMarkedDone: boolean;
};

export function DepositCheckout({
  depositId,
  methodLabel,
  amountUsd,
  address,
  qrCodeUrl,
  reference,
  initialUserMarkedDone,
}: DepositCheckoutProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isDoneLoading, setIsDoneLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userMarkedDone, setUserMarkedDone] = useState(initialUserMarkedDone);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const markDone = async () => {
    setError(null);
    setIsDoneLoading(true);
    try {
      const response = await fetch(`/api/deposits/${depositId}/done`, {
        method: "PATCH",
      });
      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.message ?? "Unable to mark as done.");
        return;
      }
      setUserMarkedDone(true);
      router.push(`/dashboard/deposit-receipt/${depositId}`);
    } catch {
      setError("Unable to mark as done.");
    } finally {
      setIsDoneLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-xl font-semibold">Proceed with Deposit</h2>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_240px]">
        <div className="rounded-xl border border-border bg-background">
          <div className="border-b border-border p-4">
            <p className="text-sm text-muted">Invoice</p>
            <p className="mt-1 text-lg font-semibold">
              Transfer Exactly <span className="text-primary">${amountUsd.toFixed(2)}</span> to:
            </p>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted">{methodLabel} Address</span>
              <span className="break-all text-sm font-semibold text-primary">{address}</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-background p-3">
          <Image
            src={qrCodeUrl}
            alt={`${methodLabel} QR Code`}
            width={240}
            height={240}
            unoptimized
            className="h-auto w-full rounded-md object-cover"
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-background p-4">
        <h3 className="text-base font-semibold">Or Copy</h3>
        <label className="mt-3 block text-sm text-muted">
          Wallet Address
          <input
            value={address}
            readOnly
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
          />
        </label>

        <div className="mt-3 flex items-center gap-2">
          <Button type="button" variant="primary" onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <p className="text-muted">
            Transaction ID: <span className="font-medium text-foreground">{reference}</span>
          </p>
          <p className="text-primary">
            Be sure you have made payment before clicking DONE.
          </p>
        </div>

        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

        {!userMarkedDone ? (
          <Button
            type="button"
            variant="gradient"
            className="mt-4"
            onClick={markDone}
            disabled={isDoneLoading}
          >
            {isDoneLoading ? "Processing..." : "DONE"}
          </Button>
        ) : (
          <p className="mt-4 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted">
            Your deposite is pending, waiting for confirmation.
          </p>
        )}
      </div>
    </section>
  );
}
