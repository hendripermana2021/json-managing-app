import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import type { DatasetStats } from "../types/json";

interface DashboardPageProps {
  stats: DatasetStats;
}

export function DashboardPage({ stats }: DashboardPageProps) {
  const cards = [
    { label: "Total Data", value: stats.totalData },
    { label: "Total Field", value: stats.totalFields },
    { label: "Duplikasi", value: stats.duplicates },
    { label: "Valid", value: stats.validRows },
    { label: "Invalid", value: stats.invalidRows },
    { label: "Completion", value: `${stats.completionPercentage}%` },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <p className="text-xs uppercase tracking-wide text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{card.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-100">Top 10 Field Kosong</h3>
        <div className="flex flex-wrap gap-2">
          {stats.emptyFieldTop10.length ? (
            stats.emptyFieldTop10.map((item) => (
              <Badge key={item.field}>{item.field}: {item.emptyCount}</Badge>
            ))
          ) : (
            <p className="text-sm text-slate-400">Belum ada data.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
