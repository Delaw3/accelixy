"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type InvestmentRow = {
  id: string;
  user: { firstname: string; lastname: string; email: string };
  planName: string;
  amount: number;
  roiPercent: number;
  expectedReturn: number;
  startedAt: string;
  endsAt: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "PAID";
};

export function AdminInvestmentsManager() {
  const [rows, setRows] = useState<InvestmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/investments");
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        data?: InvestmentRow[];
      };
      if (!response.ok || !payload.ok || !payload.data) {
        setError(payload.message ?? "Unable to load investments.");
        return;
      }
      setRows(payload.data);
    } catch {
      setError("Unable to load investments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const now = Date.now();

  const canPay = (item: InvestmentRow) => {
    const ended = new Date(item.endsAt).getTime() <= now;
    return ended && item.status !== "PAID" && item.status !== "CANCELLED";
  };

  const pay = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/investments/${id}/pay`, { method: "POST" });
      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.message ?? "Unable to pay investment.");
        return;
      }
      setRows((prev) => prev.map((item) => (item.id === id ? { ...item, status: "PAID" } : item)));
    } catch {
      setError("Unable to pay investment.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Investments</h1>
        <Button variant="ghost" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        {loading ? <p className="text-sm text-muted">Loading investments...</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">ROI</th>
                  <th className="px-3 py-2">Expected Return</th>
                  <th className="px-3 py-2">Start</th>
                  <th className="px-3 py-2">End</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="border-b border-border/60">
                    <td className="px-3 py-2">{`${item.user.firstname} ${item.user.lastname}`}</td>
                    <td className="px-3 py-2">{item.user.email}</td>
                    <td className="px-3 py-2">{item.planName}</td>
                    <td className="px-3 py-2">${item.amount.toFixed(2)}</td>
                    <td className="px-3 py-2">{item.roiPercent}%</td>
                    <td className="px-3 py-2">${item.expectedReturn.toFixed(2)}</td>
                    <td className="px-3 py-2">{new Date(item.startedAt).toLocaleString()}</td>
                    <td className="px-3 py-2">{new Date(item.endsAt).toLocaleString()}</td>
                    <td className="px-3 py-2">{item.status}</td>
                    <td className="px-3 py-2">
                      <Button
                        variant={canPay(item) ? "gradient" : "ghost"}
                        disabled={busyId === item.id || !canPay(item)}
                        onClick={() => void pay(item.id)}
                      >
                        {busyId === item.id ? "Paying..." : "Pay"}
                      </Button>
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
