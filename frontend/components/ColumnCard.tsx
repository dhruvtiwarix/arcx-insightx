type ColumnStat = {
  name: string;
  type: "numeric" | "categorical" | "datetime";
  null_pct: number;
  null_count: number;
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  p25?: number;
  p75?: number;
  distinct_count?: number;
  most_common?: string;
  most_common_pct?: number;
  min_date?: string;
  max_date?: string;
};

type Props = {
  stat: ColumnStat;
};

// Colour the null badge based on severity
function NullBadge({ pct }: { pct: number }) {
  const color =
    pct === 0
      ? "bg-green-100 text-green-700"
      : pct < 5
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {pct}% null
    </span>
  );
}

// Format large numbers cleanly: 1200000 → 1.2M
function fmt(n?: number): string {
  if (n === undefined || n === null) return "—";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export default function ColumnCard({ stat }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm
                    hover:shadow-md transition-shadow">

      {/* Column name + type badge */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900 text-sm truncate max-w-[140px]"
             title={stat.name}>
            {stat.name}
          </p>
          <span className="text-xs text-gray-400">{stat.type}</span>
        </div>
        <NullBadge pct={stat.null_pct} />
      </div>

      {/* Stats rows — different per column type */}
      <div className="space-y-1.5 text-xs text-gray-600">

        {stat.type === "numeric" && (
          <>
            <StatRow label="Mean"   value={fmt(stat.mean)} />
            <StatRow label="Median" value={fmt(stat.median)} />
            <StatRow label="Std"    value={fmt(stat.std)} />
            <StatRow label="Min"    value={fmt(stat.min)} />
            <StatRow label="Max"    value={fmt(stat.max)} />
          </>
        )}

        {stat.type === "categorical" && (
          <>
            <StatRow label="Distinct" value={String(stat.distinct_count ?? "—")} />
            <StatRow
              label="Top value"
              value={
                stat.most_common
                  ? `${stat.most_common} (${stat.most_common_pct}%)`
                  : "—"
              }
            />
            <StatRow label="Nulls" value={String(stat.null_count)} />
          </>
        )}

        {stat.type === "datetime" && (
          <>
            <StatRow label="Min date" value={stat.min_date?.split("T")[0] ?? "—"} />
            <StatRow label="Max date" value={stat.max_date?.split("T")[0] ?? "—"} />
            <StatRow label="Nulls"    value={String(stat.null_count)} />
          </>
        )}

      </div>
    </div>
  );
}

// Small helper so every row has the same layout
function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  );
}