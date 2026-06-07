import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../components/ui/card";
import type { DatasetStats } from "../types/json";

interface StatisticsPageProps {
  stats: DatasetStats;
}

export function StatisticsPage({ stats }: StatisticsPageProps) {
  const chartData = stats.emptyFieldTop10.map((item) => ({
    name: item.field,
    empty: item.emptyCount,
  }));

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Statistik Dataset</h2>
      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-3">
        <div>Total data: {stats.totalData}</div>
        <div>Total field: {stats.totalFields}</div>
        <div>Duplikasi: {stats.duplicates}</div>
        <div>Valid: {stats.validRows}</div>
        <div>Invalid: {stats.invalidRows}</div>
        <div>Completion: {stats.completionPercentage}%</div>
      </div>

      <div className="h-[420px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="empty" fill="#06b6d4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
