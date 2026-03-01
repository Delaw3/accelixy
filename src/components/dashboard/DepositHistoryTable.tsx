"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

type DepositItem = {
  id: string;
  method: string;
  amountUsd: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reference: string;
  createdAt?: string;
};

type DepositHistoryTableProps = {
  items: DepositItem[];
  pageSize?: number;
};

function formatDate(value: string | undefined) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function DepositHistoryTable({ items, pageSize = 10 }: DepositHistoryTableProps) {
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const records = useMemo(() => {
    if (deletedIds.length === 0) {
      return items;
    }
    const deletedSet = new Set(deletedIds);
    return items.filter((item) => !deletedSet.has(item.id));
  }, [deletedIds, items]);

  const visibleRecords = useMemo(
    () => records.slice(0, visibleCount),
    [records, visibleCount],
  );
  const hasMore = visibleCount < records.length;

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
        setVisibleCount((prev) => Math.min(records.length, prev + pageSize));
      },
      { rootMargin: "160px 0px" },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMore, pageSize, records.length]);

  const deleteDeposit = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/deposits/${id}/delete`, { method: "DELETE" });
      if (!response.ok) {
        return;
      }

      setDeletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } finally {
      setDeletingId(null);
    }
  };

  if (records.length === 0) {
    return <p className="mt-4 text-sm text-muted">No deposits yet.</p>;
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-175 text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-3 py-2">Method</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Reference</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleRecords.map((item) => (
              <tr key={item.id} className="border-b border-border/60">
                <td className="px-3 py-2">{item.method}</td>
                <td className="px-3 py-2">${item.amountUsd.toFixed(2)}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-3 py-2">{item.reference}</td>
                <td className="px-3 py-2">{formatDate(item.createdAt)}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/deposit-receipt/${item.id}`} className="text-primary hover:underline">
                      View
                    </Link>
                    <button
                      type="button"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-red-400 transition hover:border-red-400 hover:text-red-300"
                      disabled={deletingId === item.id}
                      onClick={() => setConfirmDeleteId(item.id)}
                      aria-label="Delete deposit history"
                    >
                      {deletingId === item.id ? (
                        <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-red-400/70" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted">
          Showing {visibleRecords.length} of {records.length} deposits
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

      {confirmDeleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-lg">
            <h4 className="text-lg font-semibold">Confirm Delete</h4>
            <p className="mt-2 text-sm text-muted">
              Are you sure you want to delete this deposit history?
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="gradient"
                disabled={Boolean(deletingId)}
                onClick={() => {
                  const id = confirmDeleteId;
                  setConfirmDeleteId(null);
                  void deleteDeposit(id);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
