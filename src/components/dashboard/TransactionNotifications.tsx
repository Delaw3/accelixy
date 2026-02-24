import { ArrowDownLeft, ArrowUpRight, Clock3 } from "lucide-react";

type TransactionNotification = {
  id: string;
  type: "deposit" | "withdrawal" | "investment";
  message: string;
  amount: string;
  time: string;
};

type TransactionNotificationsProps = {
  items: TransactionNotification[];
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

export function TransactionNotifications({ items }: TransactionNotificationsProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-xl font-semibold">Transaction Notifications</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
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
            <p className="text-sm font-semibold text-foreground">{item.amount}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
