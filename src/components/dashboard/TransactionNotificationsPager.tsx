"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

type NotificationViewItem = {
  id: string;
  type: "deposit" | "withdrawal" | "investment";
  message: string;
  amount: string;
  time: string;
};

const PAGE_SIZE = 10;

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

function mergeUniqueById(existing: NotificationViewItem[], next: NotificationViewItem[]) {
  if (existing.length === 0) {
    return next;
  }
  const ids = new Set(existing.map((item) => item.id));
  const merged = [...existing];
  for (const item of next) {
    if (!ids.has(item.id)) {
      ids.add(item.id);
      merged.push(item);
    }
  }
  return merged;
}

export function TransactionNotificationsPager() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<NotificationViewItem[]>([]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef(1);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const fetchPage = useCallback(async (nextPage: number) => {
    const response = await fetch(
      `/api/transaction-notifications?page=${nextPage}&limit=${PAGE_SIZE}`,
    );
    const payload = (await response.json()) as ApiResponse;

    if (!response.ok || !payload.ok) {
      throw new Error("Unable to load transaction notifications.");
    }

    const mapped =
      payload.data?.map((item) => ({
        id: item.id,
        type: item.type,
        message: item.message,
        amount: formatMoney(item.amount),
        time: formatRelativeTime(item.createdAt),
      })) ?? [];

    return {
      mapped,
      page: payload.pagination?.page ?? nextPage,
      totalPages: payload.pagination?.totalPages ?? 1,
    };
  }, []);

  const loadPage = useCallback(async (nextPage: number, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPage(nextPage);
      setItems((prev) => (append ? mergeUniqueById(prev, result.mapped) : result.mapped));
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch {
      setError("Unable to load transaction notifications.");
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  const refreshLoadedPages = useCallback(async () => {
    const requestedPages = Math.max(1, pageRef.current);
    setLoading(true);
    setError(null);

    try {
      let merged: NotificationViewItem[] = [];
      let lastLoadedPage = 1;
      let latestTotalPages = 1;

      for (let cursor = 1; cursor <= requestedPages; cursor += 1) {
        const result = await fetchPage(cursor);
        merged = mergeUniqueById(merged, result.mapped);
        lastLoadedPage = result.page;
        latestTotalPages = result.totalPages;
        if (cursor >= latestTotalPages) {
          break;
        }
      }

      setItems(merged);
      setPage(lastLoadedPage);
      setTotalPages(latestTotalPages);
    } catch {
      setError("Unable to load transaction notifications.");
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  useEffect(() => {
    if (!loadMoreRef.current || loading || page >= totalPages) {
      return;
    }

    const target = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loading || page >= totalPages) {
          return;
        }
        void loadPage(page + 1, true);
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [loading, loadPage, page, totalPages]);

  const hasMore = page < totalPages;

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
          onRefresh={() => {
            void loadPage(1, false);
          }}
          refreshLoading={loading}
          onItemCleared={() => {
            void refreshLoadedPages();
          }}
        />
      )}

      <p className="text-sm text-muted">
        Showing {items.length} notifications
      </p>
      {hasMore ? (
        <div
          ref={loadMoreRef}
          className="rounded-md border border-dashed border-border/70 bg-background px-3 py-2 text-center text-sm text-muted"
        >
          {loading ? "Loading more notifications..." : "Scroll to load more..."}
        </div>
      ) : null}
    </section>
  );
}
