"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );
  const hasMore = visibleCount < items.length;

  useEffect(() => {
    if (!hasMore || !loadMoreRef.current) {
      return;
    }

    const target = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) {
          return;
        }
        setVisibleCount((prev) => Math.min(items.length, prev + pageSize));
      },
      { rootMargin: "160px 0px" },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMore, items.length, pageSize]);

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
        <table className="w-full min-w-225 text-left text-sm">
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
            {visibleItems.map((item) => (
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

      <div className="space-y-2">
        <p className="text-sm text-muted">
          Showing {visibleItems.length} of {items.length} investments
        </p>
        {hasMore ? (
          <div
            ref={loadMoreRef}
            className="rounded-md border border-dashed border-border/70 bg-background px-3 py-2 text-center text-sm text-muted"
          >
            Scroll to load more...
          </div>
        ) : null}
      </div>
    </div>
  );
}
