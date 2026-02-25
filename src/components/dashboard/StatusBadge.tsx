type StatusBadgeProps = {
  status: string;
};

function getStatusClasses(status: string) {
  const normalized = status.toUpperCase();

  if (normalized === "ACTIVE" || normalized === "APPROVED" || normalized === "COMPLETED") {
    return {
      wrapper: "border-primary/40 bg-primary/15 text-primary",
      dot: "bg-primary",
    };
  }

  if (normalized === "PENDING") {
    return {
      wrapper: "border-amber-400/40 bg-amber-400/10 text-amber-400",
      dot: "bg-amber-400",
    };
  }

  if (normalized === "REJECTED" || normalized === "CANCELLED") {
    return {
      wrapper: "border-red-400/40 bg-red-400/10 text-red-400",
      dot: "bg-red-400",
    };
  }

  return {
    wrapper: "border-border bg-background text-muted",
    dot: "bg-muted",
  };
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const classes = getStatusClasses(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${classes.wrapper}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${classes.dot}`} />
      {status}
    </span>
  );
}
