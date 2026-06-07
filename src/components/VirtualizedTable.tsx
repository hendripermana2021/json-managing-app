import { memo, useMemo } from "react";
import { FixedSizeList as List, type ListChildComponentProps } from "react-window";
import { ArrowDownUp, Trash2 } from "lucide-react";
import type { DataRecord } from "../types/json";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface VirtualizedTableProps {
  rows: Array<{ sourceIndex: number; record: DataRecord }>;
  onEditCell: (rowIndex: number, field: string, value: string) => void;
  onDeleteRow: (rowIndex: number) => void;
  sortBy: string;
  sortDirection: "asc" | "desc";
  onSortBy: (field: string) => void;
}

interface RowData {
  rows: Array<{ sourceIndex: number; record: DataRecord }>;
  columns: string[];
  onEditCell: (rowIndex: number, field: string, value: string) => void;
  onDeleteRow: (rowIndex: number) => void;
}

const Row = memo(({ index, style, data }: ListChildComponentProps<RowData>) => {
  const row = data.rows[index];
  const sourceIndex = row.sourceIndex;
  const record = row.record;

  return (
    <div style={style} className="grid items-center border-b border-slate-800 bg-slate-950/20 px-2" data-row-index={index}>
      <div className="grid h-full grid-cols-[80px_repeat(var(--col-count),minmax(180px,1fr))_70px] gap-2 py-1" style={{ ["--col-count" as string]: data.columns.length }}>
        <div className="flex items-center text-xs text-slate-500">#{sourceIndex + 1}</div>
        {data.columns.map((field) => (
          <Input
            key={`${sourceIndex}-${field}`}
            value={String(record[field] ?? "")}
            onChange={(e) => data.onEditCell(sourceIndex, field, e.target.value)}
            className="h-8"
          />
        ))}
        <Button variant="destructive" size="sm" onClick={() => data.onDeleteRow(sourceIndex)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
});
Row.displayName = "Row";

export function VirtualizedTable({ rows, onEditCell, onDeleteRow, sortBy, sortDirection, onSortBy }: VirtualizedTableProps) {
  const columns = useMemo(() => {
    const keys = new Set<string>();
    rows.forEach(({ record }) => Object.keys(record).forEach((key) => keys.add(key)));
    return [...keys];
  }, [rows]);

  if (!rows.length) {
    return <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-slate-400">Dataset masih kosong.</div>;
  }

  const rowData: RowData = { rows, columns, onEditCell, onDeleteRow };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <div className="grid grid-cols-[80px_repeat(auto-fit,minmax(180px,1fr))_70px] gap-2 border-b border-slate-800 bg-slate-900 px-2 py-2">
        <div className="text-xs uppercase tracking-wide text-slate-500">Index</div>
        {columns.map((field) => (
          <button
            type="button"
            key={field}
            className="flex items-center gap-1 text-left text-xs uppercase tracking-wide text-slate-300"
            onClick={() => onSortBy(field)}
          >
            {field}
            <ArrowDownUp className="h-3 w-3" />
            {sortBy === field ? <span>{sortDirection}</span> : null}
          </button>
        ))}
        <div className="text-xs uppercase tracking-wide text-slate-500">Aksi</div>
      </div>

      <List
        height={520}
        itemCount={rows.length}
        itemSize={46}
        width="100%"
        itemData={rowData}
      >
        {Row}
      </List>
    </div>
  );
}
