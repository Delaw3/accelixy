"use client";

import { useEffect, useState } from "react";
import { TransactionNotifications } from "@/components/dashboard/TransactionNotifications";

type NotificationItem = {
  id: string;
  type: "deposit" | "withdrawal" | "investment";
  message: string;
  amount: number;
  createdAt?: string | Date;
};

type ApiResponse = {
  ok?: boolean;
  data?: NotificationItem[];
  pagination?: {
    page: number;
    totalPages: number;
  };
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatRelativeTime(value: string | Date | undefined) {
  if (!value) {
    return "Just now";
  }
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) {
    return "Just now";
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} mins ago`;
  }
  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)} hours ago`;
  }
  return `${Math.floor(seconds / 86400)} days ago`;
}

export function TransactionNotificationsPager() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<
    {
      id: string;
      type: "deposit" | "withdrawal" | "investment";
      message: string;
      amount: string;
      time: string;
    }[]
  >([]);

  const loadPage = async (nextPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/transaction-notifications?page=${nextPage}&limit=10`,
      );
      const payload = (await response.json()) as ApiResponse;
      if (!response.ok || !payload.ok) {
        setError("Unable to load transaction notifications.");
        return;
      }
      const mapped =
        payload.data?.map((item) => ({
          id: item.id,
          type: item.type,
          message: item.message,
          amount: formatMoney(item.amount),
          time: formatRelativeTime(item.createdAt),
        })) ?? [];
      setItems(mapped);
      setPage(payload.pagination?.page ?? nextPage);
      setTotalPages(payload.pagination?.totalPages ?? 1);
    } catch {
      setError("Unable to load transaction notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPage(1);
  }, []);

  return (
    <section className="space-y-4">
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {loading && items.length === 0 ? (
        <p className="text-sm text-muted">Loading notifications...</p>
      ) : (
        <TransactionNotifications
          items={items}
          title="All Transaction Notifications"
          showClearButton
          onItemCleared={() => {
            void loadPage(page);
          }}
        />
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="rounded-md border border-border bg-card px-3 py-2 text-sm disabled:opacity-50"
          disabled={page <= 1 || loading}
          onClick={() => void loadPage(page - 1)}
        >
          Previous
        </button>
        <p className="text-sm text-muted">
          Page {page} of {totalPages}
        </p>
        <button
          type="button"
          className="rounded-md border border-border bg-card px-3 py-2 text-sm disabled:opacity-50"
          disabled={page >= totalPages || loading}
          onClick={() => void loadPage(page + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
