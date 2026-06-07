import { useMemo, useState } from "react";
import { findDuplicates, removeDuplicates } from "../algorithms/duplicate";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import type { DataRecord, DuplicateModes } from "../types/json";

interface DuplicatePageProps {
  records: DataRecord[];
  selectedFields: string[];
  duplicateModes: DuplicateModes;
  onUpdateFields: (fields: string[]) => void;
  onUpdateModes: (modes: DuplicateModes) => void;
  onRemoveIndexes: (indexes: number[]) => void;
  onMergePair: (targetIndex: number, sourceIndex: number) => void;
}

export function DuplicatePage({
  records,
  selectedFields,
  duplicateModes,
  onUpdateFields,
  onUpdateModes,
  onRemoveIndexes,
  onMergePair,
}: DuplicatePageProps) {
  const [selectedDuplicateIndexes, setSelectedDuplicateIndexes] = useState<number[]>([]);

  const allFields = useMemo(() => {
    const fieldSet = new Set<string>();
    records.forEach((record) => Object.keys(record).forEach((key) => fieldSet.add(key)));
    return [...fieldSet];
  }, [records]);

  const duplicates = useMemo(() => {
    if (!selectedFields.length) {
      return [];
    }

    return findDuplicates(records, selectedFields, duplicateModes);
  }, [records, selectedFields, duplicateModes]);

  const duplicatePercentage = records.length
    ? Math.round((duplicates.length / records.length) * 10000) / 100
    : 0;

  const toggleField = (field: string) => {
    if (selectedFields.includes(field)) {
      onUpdateFields(selectedFields.filter((item) => item !== field));
      return;
    }

    onUpdateFields([...selectedFields, field]);
  };

  const togglePickDuplicate = (index: number) => {
    if (selectedDuplicateIndexes.includes(index)) {
      setSelectedDuplicateIndexes((prev) => prev.filter((item) => item !== index));
      return;
    }

    setSelectedDuplicateIndexes((prev) => [...prev, index]);
  };

  const removeAll = () => {
    const { removedIndexes } = removeDuplicates(records, selectedFields, duplicateModes);
    onRemoveIndexes(removedIndexes);
  };

  const removeSelected = () => {
    onRemoveIndexes(selectedDuplicateIndexes);
    setSelectedDuplicateIndexes([]);
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">Deteksi Duplikasi Pintar</h2>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {allFields.map((field) => (
            <label key={field} className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300">
              <input type="checkbox" checked={selectedFields.includes(field)} onChange={() => toggleField(field)} />
              {field}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={duplicateModes.caseInsensitive}
              onChange={(e) => onUpdateModes({ ...duplicateModes, caseInsensitive: e.target.checked })}
            />
            Case Insensitive
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={duplicateModes.ignoreSpaces}
              onChange={(e) => onUpdateModes({ ...duplicateModes, ignoreSpaces: e.target.checked })}
            />
            Ignore Spaces
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={duplicateModes.ignoreSpecialChars}
              onChange={(e) => onUpdateModes({ ...duplicateModes, ignoreSpecialChars: e.target.checked })}
            />
            Ignore Special Characters
          </label>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-300">
          <Badge>Total data: {records.length}</Badge>
          <Badge>Total duplikasi: {duplicates.length}</Badge>
          <Badge>Persentase: {duplicatePercentage}%</Badge>
        </div>

        <div className="flex gap-2">
          <Button onClick={removeAll} disabled={!duplicates.length || !selectedFields.length}>
            Hapus Semua Duplikasi
          </Button>
          <Button variant="secondary" onClick={removeSelected} disabled={!selectedDuplicateIndexes.length}>
            Hapus Duplikasi Terpilih
          </Button>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-100">Daftar Duplikasi</h3>
        <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
          {duplicates.map((dup) => (
            <div key={`${dup.originalIndex}-${dup.duplicateIndex}`} className="rounded-xl border border-slate-700 p-3 text-xs text-slate-300">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedDuplicateIndexes.includes(dup.duplicateIndex)}
                    onChange={() => togglePickDuplicate(dup.duplicateIndex)}
                  />
                  Pilih hapus
                </label>
                <Badge>Original #{dup.originalIndex + 1}</Badge>
                <Badge>Duplicate #{dup.duplicateIndex + 1}</Badge>
                <Badge>Field bentrok: {dup.conflictFields.join(", ")}</Badge>
                <Button size="sm" variant="ghost" onClick={() => onMergePair(dup.originalIndex, dup.duplicateIndex)}>
                  Merge
                </Button>
              </div>
              <pre className="overflow-auto rounded-lg bg-slate-950 p-2">{JSON.stringify(dup.duplicate, null, 2)}</pre>
            </div>
          ))}
          {!duplicates.length ? <p className="text-sm text-slate-400">Tidak ada duplikasi atau field belum dipilih.</p> : null}
        </div>
      </Card>
    </div>
  );
}
