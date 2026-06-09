import ColumnCard from "@/components/ColumnCard";

type Props = {
  stats: Parameters<typeof ColumnCard>[0]["stat"][];
};

export default function StatsPanel({ stats }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Column Profiles
      </h2>

      {/* Responsive grid: 2 cols on tablet, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <ColumnCard key={stat.name} stat={stat} />
        ))}
      </div>
    </div>
  );
}