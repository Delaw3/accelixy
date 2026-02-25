"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

type InvestmentHistoryItem = {
  id: string;
  planName: string;
  amount: number;
  roiPercent: number;
  expectedReturn: number;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  startedAt?: string;
  endsAt?: string;
  createdAt?: string;
};

type InvestmentHistoryTableProps = {
  items: InvestmentHistoryItem[];
  pageSize?: number;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function InvestmentHistoryTable({
  items,
  pageSize = 10,
}: InvestmentHistoryTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  if (items.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted">
        You have no investments yet. Select an investment plan to get started.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">ROI</th>
              <th className="px-3 py-2">Expected Return</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Started</th>
              <th className="px-3 py-2">Ends</th>
              <th className="px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {pagedItems.map((item) => (
              <tr key={item.id} className="border-b border-border/60">
                <td className="px-3 py-2 font-medium">{item.planName}</td>
                <td className="px-3 py-2">{formatMoney(item.amount)}</td>
                <td className="px-3 py-2">{item.roiPercent}%</td>
                <td className="px-3 py-2">{formatMoney(item.expectedReturn)}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-3 py-2">{formatDate(item.startedAt)}</td>
                <td className="px-3 py-2">{formatDate(item.endsAt)}</td>
                <td className="px-3 py-2">{formatDate(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          disabled={page <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Previous
        </Button>
        <p className="text-sm text-muted">
          Page {page} of {totalPages}
        </p>
        <Button
          type="button"
          variant="ghost"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
