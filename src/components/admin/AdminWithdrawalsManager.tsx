"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type WithdrawalRow = {
  id: string;
  amount: number;
  method: string;
  walletAddress: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt?: string;
  user: {
    firstname: string;
    lastname: string;
    email: string;
  };
};

export function AdminWithdrawalsManager() {
  const [rows, setRows] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/withdrawals");
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        data?: WithdrawalRow[];
      };
      if (!response.ok || !payload.ok || !payload.data) {
        setError(payload.message ?? "Unable to load withdrawals.");
        return;
      }
      setRows(payload.data);
    } catch {
      setError("Unable to load withdrawals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateStatus = async (id: string, status: WithdrawalRow["status"]) => {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.message ?? "Unable to update withdrawal.");
        return;
      }
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
    } catch {
      setError("Unable to update withdrawal.");
    } finally {
      setBusyId(null);
    }
  };

  const deleteRow = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/withdrawals/${id}`, { method: "DELETE" });
      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.message ?? "Unable to delete withdrawal.");
        return;
      }
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch {
      setError("Unable to delete withdrawal.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">View Withdrawals</h1>
        <Button variant="ghost" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        {loading ? <p className="text-sm text-muted">Loading withdrawals...</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Method</th>
                  <th className="px-3 py-2">Wallet Address</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Delete</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="px-3 py-2">{`${row.user.firstname} ${row.user.lastname}`}</td>
                    <td className="px-3 py-2">{row.user.email}</td>
                    <td className="px-3 py-2">${row.amount.toFixed(2)}</td>
                    <td className="px-3 py-2">{row.method}</td>
                    <td className="px-3 py-2 max-w-[180px] truncate">{row.walletAddress}</td>
                    <td className="px-3 py-2">
                      {row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {row.status === "PENDING" ? (
                        <select
                          defaultValue=""
                          onChange={(event) => {
                            const value = event.target.value as "APPROVED" | "REJECTED" | "";
                            if (!value) {
                              return;
                            }
                            void updateStatus(row.id, value);
                          }}
                          disabled={busyId === row.id}
                          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                        >
                          <option value="" disabled>
                            Select action
                          </option>
                          <option value="APPROVED">Approve</option>
                          <option value="REJECTED">Reject</option>
                        </select>
                      ) : row.status === "APPROVED" ? (
                        <span className="rounded-md border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400">
                          APPROVED
                        </span>
                      ) : (
                        <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
                          REJECTED
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => void deleteRow(row.id)}
                        disabled={busyId === row.id || row.status !== "PENDING"}
                        aria-label="Delete withdrawal"
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
    </section>
  );
}
