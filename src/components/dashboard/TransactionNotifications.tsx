"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Clock3, RefreshCw, Trash2 } from "lucide-react";

type TransactionNotification = {
  id: string;
  type: "deposit" | "withdrawal" | "investment";
  message: string;
  amount: string;
  time: string;
};

type TransactionNotificationsProps = {
  items: TransactionNotification[];
  title?: string;
  viewAllHref?: string;
  showClearButton?: boolean;
  onItemCleared?: (id: string) => void;
  onRefresh?: () => void | Promise<void>;
  refreshLoading?: boolean;
};

function TypeIcon({ type }: { type: TransactionNotification["type"] }) {
  if (type === "deposit") {
    return <ArrowDownLeft className="h-4 w-4 text-primary" />;
  }

  if (type === "withdrawal") {
    return <ArrowUpRight className="h-4 w-4 text-red-400" />;
  }

  return <Clock3 className="h-4 w-4 text-muted" />;
}

export function TransactionNotifications({
  items,
  title = "Transaction Notifications",
  viewAllHref,
  showClearButton = false,
  onItemCleared,
  onRefresh,
  refreshLoading = false,
}: TransactionNotificationsProps) {
  const router = useRouter();
  const [localItems, setLocalItems] = useState(items);
  const [clearingId, setClearingId] = useState<string | null>(null);
  const [refreshAnimating, setRefreshAnimating] = useState(false);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const clearItem = async (id: string) => {
    setClearingId(id);
    try {
      const response = await fetch(`/api/transaction-notifications/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        return;
      }
      setLocalItems((prev) => prev.filter((item) => item.id !== id));
      onItemCleared?.(id);
    } finally {
      setClearingId(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshAnimating(true);

    if (onRefresh) {
      try {
        await onRefresh();
      } finally {
        setRefreshAnimating(false);
      }
      return;
    }

    router.refresh();
    window.setTimeout(() => {
      setRefreshAnimating(false);
    }, 650);
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted transition hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => void handleRefresh()}
            disabled={refreshLoading}
            aria-label="Refresh transaction notifications"
          >
            <RefreshCw className={`h-4 w-4 ${(refreshLoading || refreshAnimating) ? "animate-spin" : ""}`} />
          </button>
          {viewAllHref ? (
            <Link href={viewAllHref} className="text-sm font-semibold text-primary hover:underline">
              View
            </Link>
          ) : null}
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {localItems.map((item) => (
          <article
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background p-3"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card">
                <TypeIcon type={item.type} />
              </span>
              <div>
                <p className="text-sm font-medium">{item.message}</p>
                <p className="mt-1 text-xs text-muted">{item.time}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-sm font-semibold text-foreground">{item.amount}</p>
              {showClearButton ? (
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-red-400 transition hover:border-red-400 hover:text-red-300"
                  disabled={clearingId === item.id}
                  onClick={() => clearItem(item.id)}
                  aria-label="Delete notification"
                >
                  {clearingId === item.id ? (
                    <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-red-400/70" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              ) : null}
            </div>
          </article>
        ))}
        {localItems.length === 0 ? (
          <p className="text-sm text-muted">No transaction notifications.</p>
        ) : null}
      </div>
    </section>
  );
}
