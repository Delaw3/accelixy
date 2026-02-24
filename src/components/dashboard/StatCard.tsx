import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-background text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-5 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </article>
  );
}
