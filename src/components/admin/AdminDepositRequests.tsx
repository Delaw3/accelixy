"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type DepositRequestRow = {
  id: string;
  username: string;
  email: string;
  amountUsd: number;
  paymentType: "USDT_BEP20" | "USDT_TRC20" | "BTC";
  walletBalance: number;
  dateOfDeposit?: string;
  transactionStatus: "PENDING" | "APPROVED" | "REJECTED";
  transactionId: string;
};

function formatPaymentType(value: DepositRequestRow["paymentType"]) {
  if (value === "USDT_BEP20") {
    return "USDT BEP20";
  }
  if (value === "USDT_TRC20") {
    return "USDT TRC20";
  }
  return "BTC";
}

export function AdminDepositRequests() {
  const [rows, setRows] = useState<DepositRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteRow, setConfirmDeleteRow] = useState<DepositRequestRow | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/deposits");
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        data?: DepositRequestRow[];
      };

      if (!response.ok || !payload.ok || !payload.data) {
        setError(payload.message ?? "Unable to load deposit requests.");
        return;
      }

      setRows(payload.data);
    } catch {
      setError("Unable to load deposit requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const approve = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/deposits/${id}/approve`, { method: "PATCH" });
      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.message ?? "Unable to approve deposit.");
        return;
      }
      setRows((prev) =>
        prev.map((item) => (item.id === id ? { ...item, transactionStatus: "APPROVED" } : item)),
      );
    } catch {
      setError("Unable to approve deposit.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/deposits/${id}`, { method: "DELETE" });
      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.message ?? "Unable to delete deposit request.");
        return;
      }
      setRows((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError("Unable to delete deposit request.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteClick = (row: DepositRequestRow) => {
    if (row.transactionStatus === "PENDING") {
      setConfirmDeleteRow(row);
      return;
    }
    void remove(row.id);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Deposite request</h1>
        <Button variant="ghost" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        {loading ? <p className="text-sm text-muted">Loading deposit requests...</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-3 py-2">USERNAME</th>
                  <th className="px-3 py-2">AMOUNT</th>
                  <th className="px-3 py-2">PAYMENT TYPE</th>
                  <th className="px-3 py-2">WALLET BALANCE</th>
                  <th className="px-3 py-2">DATE OF DEPOSIT</th>
                  <th className="px-3 py-2">TRANSACTION STATUS</th>
                  <th className="px-3 py-2">TRANSACTION ID</th>
                  <th className="px-3 py-2 text-center" colSpan={2}>OPERATIONS</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="px-3 py-2">{row.username}</td>
                    <td className="px-3 py-2">${row.amountUsd.toFixed(2)}</td>
                    <td className="px-3 py-2">{formatPaymentType(row.paymentType)}</td>
                    <td className="px-3 py-2">${row.walletBalance.toFixed(2)}</td>
                    <td className="px-3 py-2">
                      {row.dateOfDeposit ? new Date(row.dateOfDeposit).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {row.transactionStatus === "APPROVED" ? (
                        <span className="rounded-md border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400">
                          APPROVED
                        </span>
                      ) : row.transactionStatus === "PENDING" ? (
                        <span className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-400">
                          PENDING
                        </span>
                      ) : (
                        <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
                          REJECTED
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">{row.transactionId}</td>
                    <td className="px-3 py-2">
                      {row.transactionStatus === "PENDING" ? (
                        <Button
                          variant="gradient"
                          onClick={() => void approve(row.id)}
                          disabled={busyId === row.id}
                        >
                          {busyId === row.id ? "Updating..." : "Approve"}
                        </Button>
                      ) : (
                        <span className="sr-only">Action already applied</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(row)}
                        disabled={busyId === row.id}
                        aria-label="Delete deposit request"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted transition hover:text-red-400 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {confirmDeleteRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg">
            <h4 className="text-lg font-semibold text-red-400">Confirm Delete</h4>
            <p className="mt-2 text-sm text-muted">
              This deposit request is still pending and has not been approved.
              Are you sure you want to delete it?
            </p>
            <p className="mt-2 text-xs text-muted">
              Transaction ID: {confirmDeleteRow.transactionId}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDeleteRow(null)}>
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={() => {
                  const targetId = confirmDeleteRow.id;
                  setConfirmDeleteRow(null);
                  void remove(targetId);
                }}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
