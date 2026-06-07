import { useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { exportData } from "../utils/io";
import type { DataRecord, ExportFormat } from "../types/json";

interface ExportPageProps {
  records: DataRecord[];
  duplicateCount: number;
  validationErrors: number;
}

const formats: Array<{ id: ExportFormat; label: string }> = [
  { id: "json-beautified", label: "JSON Beautified" },
  { id: "json-minified", label: "JSON Minified" },
  { id: "csv", label: "CSV" },
  { id: "txt", label: "TXT" },
];

export function ExportPage({ records, duplicateCount, validationErrors }: ExportPageProps) {
  const [format, setFormat] = useState<ExportFormat>("json-beautified");

  const warning = useMemo(() => {
    if (!duplicateCount && !validationErrors) {
      return null;
    }

    return `Peringatan: masih ada ${duplicateCount} duplikasi dan ${validationErrors} error validasi.`;
  }, [duplicateCount, validationErrors]);

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Export Data</h2>
      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
        <p>Total data: {records.length}</p>
        <p>Duplikasi tersisa: {duplicateCount}</p>
        <p>Error validasi: {validationErrors}</p>
      </div>

      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as ExportFormat)}
        className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-sm text-slate-700 dark:text-slate-200"
      >
        {formats.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>

      {warning ? <p className="text-sm text-amber-300">{warning}</p> : <p className="text-sm text-emerald-300">Siap diexport.</p>}

      <Button onClick={() => exportData(records, format)}>Export</Button>
    </Card>
  );
}
