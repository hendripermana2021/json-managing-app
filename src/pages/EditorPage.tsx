import { useMemo, useState } from "react";
import { AddRecordForm } from "../components/AddRecordForm";
import { VirtualizedTable } from "../components/VirtualizedTable";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import type { DataRecord, DuplicateModes } from "../types/json";

interface EditorPageProps {
  records: DataRecord[];
  onEditCell: (rowIndex: number, field: string, value: string) => void;
  onDeleteRow: (rowIndex: number) => void;
  onAddRecord: (record: DataRecord) => void;
  onMergeIncoming: (record: DataRecord) => void;
  duplicateFields: string[];
  duplicateModes: DuplicateModes;
}

export function EditorPage({
  records,
  onEditCell,
  onDeleteRow,
  onAddRecord,
  onMergeIncoming,
  duplicateFields,
  duplicateModes,
}: EditorPageProps) {
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fields = useMemo(() => {
    const keySet = new Set<string>();
    records.forEach((record) => Object.keys(record).forEach((key) => keySet.add(key)));
    return [...keySet];
  }, [records]);

  const displayedRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    let next = records.map((record, sourceIndex) => ({ record, sourceIndex })).filter(({ record }) => {
      const values = Object.values(record).map((value) => String(value ?? "").toLowerCase());
      const globalMatch = query ? values.some((value) => value.includes(query)) : true;

      if (!globalMatch) {
        return false;
      }

      if (!filterField) {
        return true;
      }

      return String(record[filterField] ?? "").toLowerCase().includes(query);
    });

    if (sortBy) {
      next = [...next].sort((a, b) => {
        const left = String(a.record[sortBy] ?? "");
        const right = String(b.record[sortBy] ?? "");
        return sortDirection === "asc" ? left.localeCompare(right) : right.localeCompare(left);
      });
    }

    return next;
  }, [records, search, filterField, sortBy, sortDirection]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(field);
    setSortDirection("asc");
  };

  return (
    <div className="space-y-4">
      <AddRecordForm
        fields={fields}
        records={records}
        duplicateFields={duplicateFields}
        duplicateModes={duplicateModes}
        onSubmitRecord={onAddRecord}
        onMergeRecord={onMergeIncoming}
      />

      <Card className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Search realtime..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-sm text-slate-700 dark:text-slate-200"
          >
            <option value="">Filter field (opsional)</option>
            {fields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={() => setSearch("")}>Clear</Button>
        </div>

        <VirtualizedTable
          rows={displayedRows}
          onEditCell={onEditCell}
          onDeleteRow={onDeleteRow}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortBy={handleSort}
        />
      </Card>
    </div>
  );
}
