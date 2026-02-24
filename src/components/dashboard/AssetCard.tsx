type AssetCardProps = {
  name: string;
  symbol: string;
  value: string;
  change: string;
};

function isNegative(value: string) {
  return value.trim().startsWith("-");
}

export function AssetCard({ name, symbol, value, change }: AssetCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">{name}</p>
          <p className="text-sm text-muted">{symbol}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold">{value}</p>
          <p
            className={
              isNegative(change) ? "text-sm font-semibold text-red-400" : "text-sm font-semibold text-primary"
            }
          >
            {change}
          </p>
        </div>
      </div>
    </article>
  );
}
